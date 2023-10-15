import crypto from "crypto";
import * as ethers from "ethers";
import { GasModelProvider, GasModelSigner } from "@lacchain/gas-model-provider";
import { fetchVC } from "./mailbox";
import ClaimsVerifier from "./ClaimsVerifier";

import web3Abi from "web3-eth-abi";
import web3Utils from "web3-utils";
import * as ethUtil from "ethereumjs-util";
import moment from "moment";
import { Lac1DID } from "@lacchain/did";
import { NODE_ADDRESS, RPC_URL } from "../constants/env";
import {
  encodeDomain,
  getUtcDate,
  registerType2Credential,
} from "./type2Credential/credentialCreator";
import { createMockedIssuer } from "./type2Credential/mock/mockIssuer";

const CLAIMS_VERIFIER_CONTRACT_ADDRESS =
  "0x352b396727F883589ff827C53b25762605C1Cc71";

const VERIFIABLE_CREDENTIAL_TYPEHASH = web3Utils.soliditySha3(
  "VerifiableCredential(address issuer,address subject,bytes32 data,uint256 validFrom,uint256 validTo)"
);
const EIP712DOMAIN_TYPEHASH = web3Utils.soliditySha3(
  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

function sha256(data) {
  const hashFn = crypto.createHash("sha256");
  hashFn.update(data);
  return hashFn.digest("hex");
}

function getCredentialHash(vc, issuerAddress, subjectAddress) {
  const hashDiplomaHex = `0x${sha256(JSON.stringify(vc.credentialSubject))}`;

  const encodeEIP712Domain = web3Abi.encodeParameters(
    ["bytes32", "bytes32", "bytes32", "uint256", "address"],
    [
      EIP712DOMAIN_TYPEHASH,
      web3Utils.sha3("EIP712Domain"),
      web3Utils.sha3("1"),
      648529,
      CLAIMS_VERIFIER_CONTRACT_ADDRESS,
    ]
  );
  const hashEIP712Domain = web3Utils.soliditySha3(encodeEIP712Domain);

  const validFrom = new Date(vc.issuanceDate).getTime();
  const validTo = new Date(vc.expirationDate).getTime();
  const encodeHashCredential = web3Abi.encodeParameters(
    ["bytes32", "address", "address", "bytes32", "uint256", "uint256"],
    [
      VERIFIABLE_CREDENTIAL_TYPEHASH,
      issuerAddress,
      subjectAddress,
      hashDiplomaHex,
      Math.round(validFrom / 1000),
      Math.round(validTo / 1000),
    ]
  );
  const hashCredential = web3Utils.soliditySha3(encodeHashCredential);

  const encodedCredentialHash = web3Abi.encodeParameters(
    ["bytes32", "bytes32"],
    [hashEIP712Domain, hashCredential.toString(16)]
  );
  return web3Utils.soliditySha3(
    "0x1901".toString(16) + encodedCredentialHash.substring(2, 131)
  );
}

function signCredential(credentialHash, issuerPrivateKey) {
  const rsv = ethUtil.ecsign(
    Buffer.from(credentialHash.substring(2, 67), "hex"),
    Buffer.from(issuerPrivateKey, "hex")
  );
  return ethUtil.toRpcSig(rsv.v, rsv.r, rsv.s);
}

export async function syncCredentials(user, update) {
  const credentials = user.credentials || [];
  const vcs = (await fetchVC(user)).map((vc) => JSON.parse(vc.message));
  user.credentials = credentials.concat(
    vcs.reduce((a, i) => {
      if (!credentials.find((c) => c.id === i.id) && i.id) a.push(i);
      return a;
    }, [])
  );
  update(user);
  return user.credentials;
}

export async function registerCredentialMock(vc, type = "type-1") {
  if (type === "type-2") {
    const mockedIssuerResponse = await createMockedIssuer();
    if (mockedIssuerResponse.error) {
      console.log("registerCredentialMock: " + mockedIssuerResponse.message);
      return {
        error: true,
        message: mockedIssuerResponse.error,
        data: {},
      };
    }
    vc.issuer = mockedIssuerResponse.data.did;
    const domain = encodeDomain();
    const proofConfig = {
      type: "DataIntegrityProof",
      proofPurpose: "assertionMethod",
      verificationMethod: mockedIssuerResponse.data.did.concat("#vm-0"),
      // TODO: improve
      domain,
      cryptosuite: "ecdsa-jcs-2019",
      created: getUtcDate(),
    };
    const registerType2CredentialResponse = await registerType2Credential(
      vc,
      proofConfig,
      mockedIssuerResponse.data.signingKey
    );
    if (registerType2CredentialResponse.error) {
      console.log(
        "registerCredentialMock" + registerType2CredentialResponse.error
      );
      return {
        error: true,
        message: registerType2CredentialResponse.message,
        data: {},
      };
    }
    return {
      vc: registerType2CredentialResponse.data.verifiableCredential,
      tx: "",
    };
  }
  return registerType1CredentialMock(vc);
}

export async function registerType1CredentialMock(vc) {
  // const wallet = ethers.Wallet.createRandom();
  // For demo purposes: Creating an on fly issuer
  const issuer = {
    address: "0xe2fc412f96d0c184f2c950cb707fe68b98e0b529",
    privateKey:
      "b705e4debf0637e11b95d7b2743931b6059bd80cd86823791f248b85a6dfd51c",
  };
  let subjectAddress = vc.credentialSubject.id.replace(/.*:/, "");
  if (!ethers.utils.isAddress(subjectAddress)) {
    subjectAddress = Lac1DID.decodeDid(vc.credentialSubject.id).address;
  }

  const provider = new GasModelProvider(RPC_URL);
  const nodeAddress = NODE_ADDRESS;
  const expiration = Math.floor(new Date().getTime() / 1000) + 3600 * 24 * 5;
  const signer = new GasModelSigner(
    issuer.privateKey,
    provider,
    nodeAddress,
    expiration
  );

  const claimsVerifier = new ethers.Contract(
    CLAIMS_VERIFIER_CONTRACT_ADDRESS,
    ClaimsVerifier.abi,
    signer
  );

  const credentialHash = getCredentialHash(vc, issuer.address, subjectAddress);
  const signature = signCredential(credentialHash, issuer.privateKey);

  const tx = await claimsVerifier.registerCredential(
    subjectAddress,
    credentialHash,
    Math.round(moment(vc.issuanceDate).valueOf() / 1000),
    Math.round(moment(vc.expirationDate).valueOf() / 1000),
    signature,
    { from: issuer.address }
  );

  vc.proof = [
    {
      id: `did:lac:openprotest:${issuer.address}`,
      type: "EcdsaSecp256k1Signature2019",
      proofPurpose: "assertionMethod",
      verificationMethod: `${vc.issuer}#vm-0`,
      domain: CLAIMS_VERIFIER_CONTRACT_ADDRESS,
      proofValue: signature,
    },
  ];

  return { tx, vc };
}

export function presentCredential(vc, user) {
  const hash = sha256(JSON.stringify(vc));
  const signature = signCredential(`0x${hash}`, user.mainKeyPair.privateKey);

  return {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: "VerifiablePresentation",
    verifiableCredential: [vc],
    proof: [
      {
        type: "EcdsaSecp256k1Signature2019",
        created: moment().toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod: `${user.did}#vm-0`,
        proofValue: signature,
      },
    ],
  };
}
