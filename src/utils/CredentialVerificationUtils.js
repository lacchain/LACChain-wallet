import crypto from "crypto";
import { ethers } from "ethers";
import moment from "moment";
import * as ethUtil from "ethereumjs-util";
import ClaimsVerifier from "./ClaimsVerifier";
import RootOfTrust from "./RootOfTrust";
import { Decoder, Encoder, QRByte } from "@nuintun/qrcode";
import { gzip, ungzip } from "pako";
import {
  BbsBlsSignatureProof2020,
  deriveProof,
} from "@mattrglobal/jsonld-signatures-bbs";
import { extendContextLoader } from "jsonld-signatures";
import { issuers, PKDs } from "../mocks/issuers";
import { filterP256JwkPublicKeysFromJwkAssertionKeys, findDelegationKeys, resolve } from "./did";
import bbsContext from "./schemas/bbs.json";
import credentialContext from "./schemas/credentialsContext.json";
import trustedContext from "./schemas/trusted.json";
import vaccinationContext from "./schemas/vaccinationCertificateContext.json";
import educationContext from "./schemas/education.json";
import { GasModelProvider } from "@lacchain/gas-model-provider";
import DIDLac1 from "@lacchain/did/lib/lac1/lac1Did";
import { tryDecodeDomain } from "./domainType0001";
import PublicDirectoryAbi from "./PublicDirectoryAbi.js";
import ChainOfTrustAbi from "./ChainOfTrustAbi.js";
import canonicalize from "canonicalize";

const JSONLD_DOCUMENTS = {
  "https://w3id.org/security/bbs/v1": bbsContext,
  "https://www.w3.org/2018/credentials/v1": credentialContext,
  "https://credentials-library.lacchain.net/credentials/trusted/v1":
    trustedContext,
  "https://w3id.org/vaccination/v1": vaccinationContext,
  "https://credentials-library.lacchain.net/credentials/education/v1":
    educationContext,
};

const gasModeProvider = new GasModelProvider(
  "https://writer-openprotest.lacnet.com"
); // TODO: move to env
const legacyProvider = new ethers.providers.JsonRpcProvider(
  "https://writer.lacchain.net"
);
const supportedChainId = "9e55"; // hex string

export function sha256(data) {
  const hashFn = crypto.createHash("sha256");
  hashFn.update(data);
  return hashFn.digest("hex");
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const base58 = require("base-x")(BASE58);

/**
 * Retrieves and returns all data pertaining to an entity whose identifier is `id`
 * @param {string} chainId
 * @param {string} publicDirectoryContractAddress
 * @param {string} id - e.g. a decentralized identifier (did)
 * @returns
 */
export const getPublicDirectoryMember = async (
  publicDirectoryContractAddress,
  id
) => {
  // TODO: check against a list of registered PDs by this application
  const publicDirectoryContractInstance = new ethers.Contract(
    publicDirectoryContractAddress,
    PublicDirectoryAbi.abi,
    gasModeProvider
  );
  const publicDirectoryVersion =
    await publicDirectoryContractInstance.version(); //  TODO: catch
  if (publicDirectoryVersion.toString() !== "1") {
    console.log(
      "INFO:: Public Directory Version not supported: ",
      publicDirectoryVersion
    );
    return {
      error: true,
      data: {},
    };
  }
  if (!id) {
    return {
      error: true,
      data: {},
    };
  }
  const member = await publicDirectoryContractInstance.getMemberDetails(id);
  const details = member.memberData;
  const iat = parseInt(ethers.utils.formatUnits(details.iat, 0));
  const exp = parseInt(ethers.utils.formatUnits(details.exp, 0));
  const expires = details.expires;
  const currentTime = Math.floor(Date.now() / 1000);
  if (
    iat === 0 ||
    (expires === true && exp < currentTime)
  ) {
    console.log("INFO:: Member has expired or is no longer valid");
    return {
      error: false,
      data: {
        isMember: false,
      },
    };
  }

  const lastBlockChange = parseInt(
    ethers.utils.formatUnits(member.lastBlockChange, 0)
  );
  // TODO: resolve member data from last block change
  const memberData = await getMemberData(
    lastBlockChange,
    id,
    publicDirectoryContractAddress
  );
  if (memberData.error) {
    return {
      error: true,
      data: {},
    };
  }
  const memberIdentificationDetails = memberData.data;
  const legalName =
    memberIdentificationDetails &&
    memberIdentificationDetails.identificationData &&
    memberIdentificationDetails.identificationData.legalName
      ? memberIdentificationDetails.identificationData.legalName
      : null;
  const alpha3CountryCode =
    memberIdentificationDetails &&
    memberIdentificationDetails.identificationData &&
    memberIdentificationDetails.identificationData.countryCode
      ? memberIdentificationDetails.identificationDatacountryCode
      : null;
  return {
    error: false,
    data: {
      isMember: true,
      legalName,
      alpha3CountryCode,
    },
  };
};

// TODO: conclude logic for iterating over events
/**
 * Iteratively checks moving backwards until finding all data related to the entity being queried for.
 * @param {string} blockNumber : Last block where changes took place
 * @param {string} id - E.g. a decentralized identifier (did)
 * @param {string} publicDirectoryContractAddress - Contract address pertaining to the Public Directory to query against.
 * @returns
 */
export const getMemberData = async (
  blockNumber,
  id,
  publicDirectoryContractAddress
) => {
  try {
    const publicDirectoryContractInstance = new ethers.Contract(
      publicDirectoryContractAddress,
      PublicDirectoryAbi.abi,
      gasModeProvider
    );

    const data = await publicDirectoryContractInstance.queryFilter(
      "MemberChanged",
      blockNumber,
      blockNumber
    );
    const found = data.find(
      (log) =>
        log.address.toLocaleLowerCase() ===
        publicDirectoryContractAddress.toLocaleLowerCase()
    );
    if (!found) {
      return {
        error: false,
        message: null,
        data: {
          isRaw: null,
        },
      };
    }
    const rawData = found.args.rawData;
    const decodedFromHex = Buffer.from(
      rawData.replace("0x", ""),
      "hex"
    ).toString();
    const parsedData = JSON.parse(decodedFromHex);
    // TODO: define association between type and version better in regards to a certain public directory metaclass
    return {
      error: false,
      message: null,
      data: parsedData,
    };
  } catch (err) {
    const message =
      "There was an error while retrieving data for the member being queried";
    console.log("Error::", message, err);
    return {
      error: true,
      message,
      data: {},
    };
  }
};

export const verifyChainId = (chainId) => {
  const message = "Unsupported chain";
  try {
    if (
      chainId &&
      chainId.toLowerCase().replace("0x", "") === supportedChainId
    ) {
      return {
        error: false,
        message: null,
        data: {
          isSupported: true,
          message: "",
        },
      };
    }
    return {
      error: false,
      message: null,
      data: {
        isSupported: false,
        message,
      },
    };
  } catch (e) {
    return {
      error: true,
      message: "There was a error while trying to validate chainId",
      data: {},
    };
  }
};

// TODO: handle errors better
/**
 * Checks whether the signature associated with the passed proof is correct or not.
 * @param {any} vc
 * @param {any} proof
 * @returns
 */
export const verifyOffChainCredentialSignature = async (vc, proof) => {
  // TODO: Validate according to proof
  // Validate signature first
  // TODO remove this decode domain and replace with a more abstract logic
  // It is made to verify how to resolve the key is valid for the associated issuer
  const { error, message } = tryDecodeDomain(proof.domain);
  if (error) {
    return {
      error: true,
      message,
      data: {},
    };
  }
  // let matchingAssertionKey;
  try {
    if (proof.cryptosuite && proof.cryptosuite === "ecdsa-jcs-2019") {
      const res = await verifyEcdsaJcs2019ProofSignature(vc, proof);
      return res;
    }
    return {
      error: true,
      message: "Proof doesn't have 'cryptosuite' property",
      data: {}
    }
  }catch(e) {
    return {
      error: true,
      message: "Error while verifying Signature: " + e.message,
      data: {},
    };  
  }
};

const verifyEcdsaJcs2019ProofSignature = async (vc, proof) => {
  const v = JSON.parse(JSON.stringify(vc));
  delete v.proof;
  const transformedDocument = canonicalize(v);
  const transformedDocumentHash = crypto
    .createHash("sha256")
    .update(transformedDocument)
    .digest("hex");

  const proofConfig = JSON.parse(JSON.stringify(proof));
  delete proofConfig.proofValue;
  const canonicalProofConfig = canonicalize(proofConfig);
  const proofConfigHash = crypto
    .createHash("sha256")
    .update(canonicalProofConfig)
    .digest("hex");

  const hashData = proofConfigHash.concat(transformedDocumentHash);
  let proofBytes;
  try {
    proofBytes = Buffer.from(base58.decode(proof.proofValue));
  } catch (e) {
    return {
      error: true,
      message: "Error while decoding proofValue: " + e.message,
      data: {},
    };
  }

  // resolving public key candidates from DidDocument
  // TODO: validate resolution is made against the right resolver
  const didDocument = await resolve(vc.issuer);
  const matchingAssertionKeys = filterP256JwkPublicKeysFromJwkAssertionKeys(
    didDocument,
    "JsonWebKey2020"
  ).filter((el) => el.id === proof.verificationMethod);

  for (const pubKey of matchingAssertionKeys) {
    try {
      const subtle = window.crypto.subtle;
      const importedKey = await subtle.importKey(
        "jwk",
        pubKey.publicKeyJwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      );

      const result = await subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        importedKey,
        proofBytes,
        Buffer.from(hashData, "hex")
      );
      if (result === true) {
        return {
          error: false,
          data: {
            issuerSignatureValid: true,
          },
        };
      }
    } catch (e) {
      continue;
    }
  }
  return {
    error: true,
    message: "Unable to verify ecdsa-jcs-2019 proof",
    data: {},
  };
};

export const isType2CredentialValidator = async (vc, proofArray) => {
  const invalidResponse = {
    error: false,
    message: undefined,
    data: {
      isType2Credential: false
    },
  };
  if (!proofArray || !Array.isArray(proofArray) || proofArray.length ===0) {
    return invalidResponse;
  }
  const proof = proofArray[0]; // just taking the first element
  const { error } = tryDecodeDomain(proof.domain);
  if (error) {
    return invalidResponse;
  }
  const isVersion2 = vc["@context"] && vc["@context"].find(el => el === "https://www.w3.org/ns/credentials/v2");
  if (!isVersion2) {
    return invalidResponse;
  }
  return {
    error: false,
    message: undefined,
    data: {
      isType2Credential: true
    }
  }
}

// TODO: implement credential exists, isNotRevoked and isNotExpired
/**
 * Given a verifiable credential and a set of proofs associated to it, gets the first proof and verifies the VC.
 * A type 2 credential has: proof with "type" "DataIntegrityProof" (eht only one supported at at this time) and
 * optionaly a decodable "domain"
 * @param {*} vc 
 * @param {*} proofArray 
 * @returns 
 */
export const type2VerifyCredential = async (vc, proofArray) => {
  if (!proofArray || !Array.isArray(proofArray) || proofArray.length ===0) {
    const message = "Invalid proof array";
    return {
      error: true,
      message,
      data: {},
    }
  }
  // TODO: implement a logic to get a proof with some logic
  // TODO: IMPLEMENT!
  const proof = proofArray[0]; // just taking the first element
  const { error, data, message } = tryDecodeDomain(proof.domain);
  if (error) {
    return {
      error,
      message,
      data: {},
    };
  }

  const isSupportedChain = verifyChainId(data.chainId);
  if (isSupportedChain.error) {
    return {
      error: true,
      message: isSupportedChain.message,
      data: {},
    };
  }
  if (!isSupportedChain.data.isSupported) {
    return {
      error: true,
      message: isSupportedChain.data.message,
      data: {},
    };
  }

  const signatureResponse = await verifyOffChainCredentialSignature(vc, proof);
  if (signatureResponse.error) {
    return {
      error: true,
      message: signatureResponse.message,
      data: {}
    }
  }

  // TODO: verify against verification registry: it is not revoked
  return {
    error: false,
    data: {
      credentialExists: true,
      isNotRevoked: true,
      issuerSignatureValid: signatureResponse.data.issuerSignatureValid,
      additionalSigners: false,
      isNotExpired: true,
    },
  };
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
    gasModeProvider
  );

  try {
    const data = `0x${sha256(JSON.stringify(vc.credentialSubject))}`;
    const rsv = ethUtil.fromRpcSig(vc.proof[0].proofValue);
    const result = await contract.verifyCredential(
      [
        vc.issuer.replace(/.*:/, ""),
        ethers.utils.isAddress(vc.credentialSubject.id.replace(/.*:/, ""))
          ? vc.credentialSubject.id.replace(/.*:/, "")
          : DIDLac1.decodeDid(vc.credentialSubject.id).address,
        data,
        Math.round(moment(vc.issuanceDate).valueOf() / 1000),
        Math.round(moment(vc.expirationDate).valueOf() / 1000),
      ],
      rsv.v,
      rsv.r,
      rsv.s
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
      }
    };
  }catch(e) {
    return {
      error: true,
      message: "ERROR:: Unable to verify 'type1' credential",
      data: {
        credentialExists: false,
        isNotRevoked: false,
        issuerSignatureValid: false,
        additionalSigners: false,
        isNotExpired: false,
      }
    };
  }
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
  if (!vc.proof || !vc.proof[0].domain)
    return {
      error: false,
      message: undefined,
      data: {
        credentialExists: false,
        isNotRevoked: false,
        issuerSignatureValid: false,
        additionalSigners: false,
        isNotExpired: false,
      }
    };
  try {
    const isType2Credential = await isType2CredentialValidator(vc, vc.proof);
    if (isType2Credential) {
      const type2VerifyCredentialResponse = await type2VerifyCredential(vc, vc.proof);
      return type2VerifyCredentialResponse;
    }
    // it it was not type2Credential then just defaulting to type1Credential
    const t1 = await type1VerifyCredential(vc);
    return t1;
  } catch (e) {
    return {
      error: true,
      message: 'Unable to verify credential' + e.message,
      data: {}
    }
  }
};

export const verifySignature = async (vc, signature) => {
  const contract = new ethers.Contract(
    vc.proof[0].domain,
    ClaimsVerifier.abi,
    legacyProvider
  );

  const data = `0x${sha256(JSON.stringify(vc.credentialSubject))}`;

  return await contract.verifySigner(
    [
      vc.issuer.replace(/.*:/, ""),
      ethers.utils.isAddress(vc.credentialSubject.id.replace(/.*:/, ""))
        ? vc.credentialSubject.id.replace(/.*:/, "")
        : DIDLac1.decodeDid(vc.credentialSubject.id).address,
      data,
      Math.round(moment(vc.issuanceDate).valueOf() / 1000),
      Math.round(moment(vc.expirationDate).valueOf() / 1000),
    ],
    signature
  );
};

/**
 * Starting from a did and an a chain of trust contract address, iterates
 * over did-document to find a delegation key that checked against the chain of trust
 * can return true.
 * @param {string} chainOfTrustContractAddress
 * @param {string} publicDirectoryContractAddress
 * @param {string} chainId - hex string of the chain Id
 * @param {string} id - Typically a decentralized identifier (did)
 */
export const getChainOfTrust = async (
  chainOfTrustContractAddress,
  publicDirectoryContractAddress,
  chainId,
  id
) => {
  const isSupportedChain = verifyChainId(chainId);
  if (isSupportedChain.error) {
    return {
      error: true,
      message: isSupportedChain.message,
      data: {},
    };
  }
  if (!isSupportedChain.data.isSupported) {
    return {
      error: true,
      message: isSupportedChain.data.message,
      data: {},
    };
  }

  const chainOfTrustContractInstance = new ethers.Contract(
    chainOfTrustContractAddress,
    ChainOfTrustAbi.abi,
    gasModeProvider
  ); // TODO: implement
  const candidateManagersResponse = await getManagersCandidates(id);
  if (candidateManagersResponse.error) {
    return {
      error: true,
      message: candidateManagersResponse.message,
      data: {},
    };
  }
  const candidateManagers = candidateManagersResponse.data.managerCandidateKeys;
  const reversedTrustTree = [];
  // loop through the candidates
  for (const managerCandidate of candidateManagers) {
    // TODO: handle external call
    const response =
      await chainOfTrustContractInstance.getMemberDetailsByEntityManager(
        managerCandidate
      );
    const memberId = parseInt(ethers.utils.formatUnits(response.gId, 0));
    const pdMemberResponse = await getPublicDirectoryMember(
      publicDirectoryContractAddress,
      id
    );
    let name;
    if (
      pdMemberResponse.error ||
      !pdMemberResponse.data.isMember ||
      !pdMemberResponse.data.legalName
    ) {
      name = "Unknown";
    }
    name = pdMemberResponse.data.legalName;
    if (memberId > 0 && response.isValid) {
      const trustElement = {
        valid: response.isValid ? true : false,
        address: response.did,
        name,
      };
      reversedTrustTree.push(trustElement);
      let trustedBy = response.trustedBy;
      let iter = 0;
      while (trustedBy && iter < 4) {
        // limiting since it is not optimized to make multiple calls
        console.log("INFO:: Getting Root; teration #", iter + 2);
        const r =
          await chainOfTrustContractInstance.getMemberDetailsByEntityManager(
            trustedBy
          );
        if (!r.isValid) {
          break;
        }
        const pdMemberResponse = await getPublicDirectoryMember(
          publicDirectoryContractAddress,
          r.did
        );
        let name = null; //"Unknown";
        if (
          !pdMemberResponse.error &&
          pdMemberResponse.data.isMember &&
          pdMemberResponse.data.legalName
        ) {
          name = pdMemberResponse.data.legalName;
        }
        const trustElement = {
          valid: true,
          address: r.did,
          name,
        };
        reversedTrustTree.push(trustElement);
        if (r.trustedBy === ethers.constants.AddressZero) break;
        trustedBy = r.trustedBy;
        iter++;
      }
      break;
    }
  }

  // TODO: get full chain of trust
  return {
    error: false,
    message: null,
    data: {
      trustTree: reversedTrustTree.reverse(),
    },
  };
};

/**
 * Gets delegation keys of type "EcdsaSecp256k1RecoveryMethod2020" and whose value is an ethereum address (BlockchainAccountId)
 * @notice As an improvement the usage of a multicall contract will allow handling many delegation keys at once.
 * @param {*} did
 * @returns - An array of candidate keys to be the managers. e.g. ['0x123...', '0xf45a2e...']
 */
export const getManagersCandidates = async (did) => {
  const didDocument = await resolve(did);
  const delegationKeys = findDelegationKeys(
    didDocument,
    "EcdsaSecp256k1RecoveryMethod2020"
  ).map((delegationKey) => "0x" + Buffer.from(delegationKey).toString("hex"));
  if (delegationKeys.length > 5) {
    return {
      error: true,
      message: "Too many delegation keys to process",
    };
  }
  return {
    error: false,
    message: null,
    data: {
      managerCandidateKeys: delegationKeys,
    },
  };
};

export const resolveRootOfTrustByDomain = async (proofs, issuer) => {
  const emptyResponse = {
    error: false,
    message: null,
    data: {
      trustTree: [],
    },
  };
  try {
    // TODO: choose just one proof .. the issuer one
    const foundProof = proofs.find((proof) => {
      const vm = proof.verificationMethod; // TODO: catch
      const did = vm.substring(0, vm.indexOf("#"));
      return did === issuer;
    });

    if (!foundProof || !foundProof.domain) {
      return emptyResponse;
    }
    const domain = foundProof.domain;
    const { error, data } = tryDecodeDomain(domain);
    if (error) {
      return emptyResponse;
    }
    const {
      chainOfTrustContractAddress,
      chainId,
      publicDirectoryContractAddress,
    } = data;
    if (
      chainOfTrustContractAddress === ethers.constants.AddressZero ||
      publicDirectoryContractAddress === ethers.constants.AddressZero
    ) {
      return emptyResponse;
    }
    const vm = foundProof.verificationMethod; // TODO: catch
    const did = vm.substring(0, vm.indexOf("#"));
    const chainOfTrustResponse = await getChainOfTrust(
      chainOfTrustContractAddress,
      publicDirectoryContractAddress,
      chainId,
      did
    ); // TODO: improve searching, by caching, in case did repeats
    if (chainOfTrustResponse.error) {
      return emptyResponse;
    }
    return {
      error: false,
      message: null,
      data: {
        trustTree: chainOfTrustResponse.data.trustTree,
      },
    };
  } catch (e) {
    const message = "There was an error while verifying against chain of trust";
    return {
      error: true,
      message,
      data: {},
    };
  }
};

export const getRootOfTrust = async (trustedList, issuerCandidate) => {
  if (!trustedList) return [];
  const tlContract = new ethers.Contract(
    trustedList,
    RootOfTrust.trustedList,
    legacyProvider
  );

  const issuerAddress = issuerCandidate.replace(/.*:/, "");
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
      legacyProvider
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
        name: "Public Key Directory",
      });
      break;
    }
  }

  return rootOfTrust.reverse();
};

export const verifyRootOfTrust = async (rootOfTrust, issuer) => {
  if (rootOfTrust.length <= 0) return [];
  if (rootOfTrust[0].address === "0x5672778D37604b365289c9CcA4dE0aE28365E2Ad")
    return new Array(rootOfTrust.length).fill(true);
  const validation = new Array(rootOfTrust.length).fill(false);
  const root = new ethers.Contract(
    rootOfTrust[0].address,
    RootOfTrust.pkd,
    legacyProvider
  );
  if ((await root.publicKeys(rootOfTrust[1].address)).status <= 0)
    return validation;
  validation[0] = !!PKDs[rootOfTrust[0].address];
  if (!validation[0]) return validation;
  let index = 1;
  for (const tl of rootOfTrust.slice(1)) {
    const tlContract = new ethers.Contract(
      tl.address,
      RootOfTrust.trustedList,
      legacyProvider
    );
    if (index + 2 >= rootOfTrust.length) {
      validation[index] =
        (await tlContract.entities(issuer.replace(/.*:/, ""))).status === 1;
      // TODO: validate issuer signature (this is the last item of root of trust i.e. the issuer)
      validation[index + 1] = true;
      return validation;
    }
    if ((await tlContract.entities(rootOfTrust[index + 1].address)).status <= 0)
      return validation;
    validation[index++] = true;
  }

  return validation;
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
  proofs = undefined
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
    const fullyValidated = rootOfTrust.map((el, index) => {
      return {
        address: el.address,
        name: el.name,
        valid: validation[index],
      };
    });
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

export const deriveCredential = async (vc, fields) => {
  const issuerDocument = await resolve(vc.issuer);
  const documentLoader = extendContextLoader((uri) => {
    if (uri.startsWith("did")) {
      const document =
        uri.indexOf("#") >= 0
          ? issuerDocument.assertionMethod.find((am) => am.publicKeyBase58)
          : issuerDocument;
      if (uri.indexOf("#")) {
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
    "@context": vc["@context"],
    type: vc["type"],
    credentialSubject: {
      type: vc["credentialSubject"].type,
      "@explicit": true,
      ...fields
        .filter((field) => field !== "id" && field !== "type")
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
    "base64"
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
        })
      )
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

  const unzipped = new Buffer(ungzip(new Buffer(result, "base64"))).toString();
  return JSON.parse(unzipped);
};

export const toEUCertificate = (vc) => {
  const {
    name,
    birthDate,
    vaccine: { dose, vaccinationDate },
  } = vc.credentialSubject;
  const gn = name.substring(0, name.indexOf(" "));
  const fn = name.substring(name.indexOf(" ") + 1);
  return {
    ver: "1.3.0",
    nam: {
      fn: fn,
      fnt: fn.replace(" ", "<").replace("ó", "o").toUpperCase(),
      gn: gn,
      gnt: gn.replace(" ", "<").toUpperCase(),
    },
    dob: moment(birthDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
    v: [
      {
        tg: "840539006",
        vp: "1119349007",
        mp: "EU/1/20/1507",
        ma: "ORG-100031184",
        dn: dose,
        sd: 2,
        dt: moment(vaccinationDate).format("YYYY-MM-DD"),
        co: "CL",
        is: issuers[vc.issuer].name,
        ci: "URN:UVCI:01:CL:DADFCC47C7334E45A906DB12FD859FB7#1",
      },
    ],
  };
};
