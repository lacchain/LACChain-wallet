import { ethers } from 'ethers';
import moment from 'moment';
import * as ethUtil from 'ethereumjs-util';
import { Decoder, Encoder, QRByte } from '@nuintun/qrcode';
import { gzip, ungzip } from 'pako';
import {
  BbsBlsSignatureProof2020,
  deriveProof,
} from '@mattrglobal/jsonld-signatures-bbs';
import { extendContextLoader } from 'jsonld-signatures';
import DIDLac1 from '@lacchain/did/lib/lac1/lac1Did';
import ClaimsVerifier from './ClaimsVerifier';
import RootOfTrust from './RootOfTrust';
import { issuers, PKDs } from '../mocks/issuers';
import bbsContext from './schemas/bbs.json';
import credentialContext from './schemas/credentialsContext.json';
import trustedContext from './schemas/trusted.json';
import vaccinationContext from './schemas/vaccinationCertificateContext.json';
import educationContext from './schemas/education.json';
import { gasModelProvider, legacyProvider } from '../constants/blockchain';
import { sha256 } from './cryptoUtils';
import {
  isType2CredentialValidator,
  type2VerifyCredential,
} from './type2Credential/type2CredentialUtils';
import { resolveRootOfTrustByDomain } from './type2Credential/rootOfTrust';
import { resolve } from './did';

const JSONLD_DOCUMENTS = {
  'https://w3id.org/security/bbs/v1': bbsContext,
  'https://www.w3.org/2018/credentials/v1': credentialContext,
  'https://credentials-library.lacchain.net/credentials/trusted/v1':
    trustedContext,
  'https://w3id.org/vaccination/v1': vaccinationContext,
  'https://credentials-library.lacchain.net/credentials/education/v1':
    educationContext,
};

// TODO: validate signer is in the did document
// TODO: implement credential PoE validation and non onchain revocation
// TODO: implement non expired verification
/**
 * validates the following:
 * credentialExists: boolean,
 * isNotRevoked: boolean,
 * issuerSignatureValid: boolean,
 * additionalSigners?: boolean,
 * isNotExpired: boolean,
 * When "domain" attribute (in the proof) is decodable then "credentialExists" and "isNotRevoked" are onchain validated according to:
 * https://github.com/lacchain/LACChain-base-contracts/blob/master/docs/functional/verificationRegistry.md, otherwise all fields are onchain validated
 * through https://github.com/lacchain/vc-contracts.
 * @param {*} vc
 * @returns
 */
export const verifyCredential = async (vc) => {
  if (!vc.proof || !vc.proof[0].domain) {
    return {
      error: false,
      message: undefined,
      data: {
        credentialExists: false,
        isNotRevoked: false,
        issuerSignatureValid: false,
        additionalSigners: false,
        isNotExpired: false,
      },
    };
  }
  try {
    const isType2Credential = await isType2CredentialValidator(vc, vc.proof);
    if (
      isType2Credential
      && !isType2Credential.error
      && isType2Credential.data.isType2Credential
    ) {
      const type2VerifyCredentialResponse = await type2VerifyCredential(
        vc,
        vc.proof,
      );
      return type2VerifyCredentialResponse;
    }
    // it it was not type2Credential then just defaulting to type1Credential
    const t1 = await type1VerifyCredential(vc);
    return t1;
  } catch (e) {
    return {
      error: true,
      message: `Unable to verify credential: ${e.message}`,
      data: {},
    };
  }
};

/**
 * Proof is required since from this argument is attempted to resolve a "domain" which in turn resolves
 * the public directory and chain of trust under which the issuer of a credential claims the verifiable credential
 * to be trusted.
 * @param {any} proofs
 * @param {string} issuer
 * @param {string} trustedList
 * @returns
 */
export const resolveRootOfTrust = async (
  issuer,
  trustedList,
  proofs = undefined,
) => {
  const rotByDomainResponse = await resolveRootOfTrustByDomain(proofs, issuer);
  if (!rotByDomainResponse.error) {
    return {
      error: false,
      message: null,
      data: {
        trustTree: rotByDomainResponse.data.trustTree,
      },
    };
  }
  try {
    const rootOfTrust = await getRootOfTrust(trustedList, issuer);
    const validation = await verifyRootOfTrust(rootOfTrust, issuer);
    const fullyValidated = rootOfTrust.map((el, index) => ({
      address: el.address,
      name: el.name,
      valid: validation[index],
    }));
    return {
      error: false,
      message: null,
      data: {
        trustTree: fullyValidated,
      },
    };
  } catch {
    return {
      error: true,
      message: null,
      data: {},
    };
  }
};

export const verifySignature = async (vc, signature) => {
  const contract = new ethers.Contract(
    vc.proof[0].domain,
    ClaimsVerifier.abi,
    legacyProvider,
  );

  const data = `0x${sha256(JSON.stringify(vc.credentialSubject))}`;

  return await contract.verifySigner(
    [
      vc.issuer.replace(/.*:/, ''),
      ethers.utils.isAddress(vc.credentialSubject.id.replace(/.*:/, ''))
        ? vc.credentialSubject.id.replace(/.*:/, '')
        : DIDLac1.decodeDid(vc.credentialSubject.id).address,
      data,
      Math.round(moment(vc.issuanceDate).valueOf() / 1000),
      Math.round(moment(vc.expirationDate).valueOf() / 1000),
    ],
    signature,
  );
};

export const getRootOfTrust = async (trustedList, issuerCandidate) => {
  if (!trustedList) return [];
  const tlContract = new ethers.Contract(
    trustedList,
    RootOfTrust.trustedList,
    legacyProvider,
  );

  const issuerAddress = issuerCandidate.replace(/.*:/, '');
  const issuer = await tlContract.entities(issuerAddress);
  const rootOfTrust = [
    {
      address: issuerAddress,
      name: issuer.name,
    },
    {
      address: trustedList,
      name: await tlContract.name(),
    },
  ];
  let parent = await tlContract.parent();
  for (const index of [1, 2, 3, 4, 5, 6]) {
    const contract = new ethers.Contract(
      parent,
      RootOfTrust.trustedList,
      legacyProvider,
    );
    try {
      rootOfTrust.push({
        address: parent,
        name: await contract.name(),
      });
      parent = await contract.parent();
    } catch (e) {
      rootOfTrust.push({
        address: parent,
        name: 'Public Key Directory',
      });
      break;
    }
  }

  return rootOfTrust.reverse();
};

export const verifyRootOfTrust = async (rootOfTrust, issuer) => {
  if (rootOfTrust.length <= 0) return [];
  if (rootOfTrust[0].address === '0x5672778D37604b365289c9CcA4dE0aE28365E2Ad') return new Array(rootOfTrust.length).fill(true);
  const validation = new Array(rootOfTrust.length).fill(false);
  const root = new ethers.Contract(
    rootOfTrust[0].address,
    RootOfTrust.pkd,
    legacyProvider,
  );
  if ((await root.publicKeys(rootOfTrust[1].address)).status <= 0) return validation;
  validation[0] = !!PKDs[rootOfTrust[0].address];
  if (!validation[0]) return validation;
  let index = 1;
  for (const tl of rootOfTrust.slice(1)) {
    const tlContract = new ethers.Contract(
      tl.address,
      RootOfTrust.trustedList,
      legacyProvider,
    );
    if (index + 2 >= rootOfTrust.length) {
      validation[index] = (await tlContract.entities(issuer.replace(/.*:/, ''))).status === 1;
      // TODO: validate issuer signature (this is the last item of root of trust i.e. the issuer)
      validation[index + 1] = true;
      return validation;
    }
    if ((await tlContract.entities(rootOfTrust[index + 1].address)).status <= 0) return validation;
    validation[index++] = true;
  }

  return validation;
};

/**
 * Full onchain Verification according to https://github.com/lacchain/vc-contracts
 * @param {*} vc
 * @returns
 */
export const type1VerifyCredential = async (vc) => {
  const contract = new ethers.Contract(
    vc.proof[0].domain,
    ClaimsVerifier.abi,
    gasModelProvider().data.provider,
  );

  try {
    const data = `0x${sha256(JSON.stringify(vc.credentialSubject))}`;
    const rsv = ethUtil.fromRpcSig(vc.proof[0].proofValue);
    const result = await contract.verifyCredential(
      [
        vc.issuer.replace(/.*:/, ''),
        ethers.utils.isAddress(vc.credentialSubject.id.replace(/.*:/, ''))
          ? vc.credentialSubject.id.replace(/.*:/, '')
          : DIDLac1.decodeDid(vc.credentialSubject.id).address,
        data,
        Math.round(moment(vc.issuanceDate).valueOf() / 1000),
        Math.round(moment(vc.expirationDate).valueOf() / 1000),
      ],
      rsv.v,
      rsv.r,
      rsv.s,
    );

    const credentialExists = result[0];
    const isNotRevoked = result[1];
    const issuerSignatureValid = result[2];
    const additionalSigners = result[3];
    const isNotExpired = result[4];

    return {
      error: false,
      message: undefined,
      data: {
        credentialExists,
        isNotRevoked,
        issuerSignatureValid,
        additionalSigners,
        isNotExpired,
      },
    };
  } catch (e) {
    return {
      error: true,
      message: "ERROR:: Unable to verify 'type1' credential",
      data: {
        credentialExists: false,
        isNotRevoked: false,
        issuerSignatureValid: false,
        additionalSigners: false,
        isNotExpired: false,
      },
    };
  }
};

export const deriveCredential = async (vc, fields) => {
  const issuerDocument = await resolve(vc.issuer);
  const documentLoader = extendContextLoader((uri) => {
    if (uri.startsWith('did')) {
      const document = uri.indexOf('#') >= 0
        ? issuerDocument.assertionMethod.find((am) => am.publicKeyBase58)
        : issuerDocument;
      if (uri.indexOf('#')) {
        document.id = uri;
      }
      return { document };
    }

    const document = JSONLD_DOCUMENTS[uri];
    if (!document) {
      throw new Error(`Unable to load document : ${uri}`);
    }
    return {
      contextUrl: null,
      document,
      documentUrl: uri,
    };
  });
  const fragment = {
    '@context': vc['@context'],
    type: vc.type,
    credentialSubject: {
      type: vc.credentialSubject.type,
      '@explicit': true,
      ...fields
        .filter((field) => field !== 'id' && field !== 'type')
        .reduce((dic, field) => ({ ...dic, [field]: {} }), {}),
    },
  };
  return await deriveProof(vc, fragment, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });
};

export const toQRCode = async (vc) => {
  const credential = new Buffer(gzip(JSON.stringify(vc, null, 2))).toString(
    'base64',
  );
  const qrcode = new Encoder();
  qrcode.setEncodingHint(true);
  if (vc.hash) {
    qrcode.write(
      new QRByte(
        JSON.stringify({
          hash: vc.hash,
          issuanceDate: vc.issuanceDate,
          expirationDate: vc.expirationDate,
          subject: vc.credentialSubject.recipient,
        }),
      ),
    );
  } else {
    qrcode.write(new QRByte(credential));
  }
  qrcode.make();
  return qrcode.toDataURL();
};

export const fromCborQR = async (cborQR) => {
  const qrcode = new Decoder();
  const result = await qrcode.scan(cborQR);

  const unzipped = new Buffer(ungzip(new Buffer(result, 'base64'))).toString();
  return JSON.parse(unzipped);
};

export const toEUCertificate = (vc) => {
  const {
    name,
    birthDate,
    vaccine: { dose, vaccinationDate },
  } = vc.credentialSubject;
  const gn = name.substring(0, name.indexOf(' '));
  const fn = name.substring(name.indexOf(' ') + 1);
  return {
    ver: '1.3.0',
    nam: {
      fn,
      fnt: fn.replace(' ', '<').replace('ó', 'o').toUpperCase(),
      gn,
      gnt: gn.replace(' ', '<').toUpperCase(),
    },
    dob: moment(birthDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    v: [
      {
        tg: '840539006',
        vp: '1119349007',
        mp: 'EU/1/20/1507',
        ma: 'ORG-100031184',
        dn: dose,
        sd: 2,
        dt: moment(vaccinationDate).format('YYYY-MM-DD'),
        co: 'CL',
        is: issuers[vc.issuer].name,
        ci: 'URN:UVCI:01:CL:DADFCC47C7334E45A906DB12FD859FB7#1',
      },
    ],
  };
};
