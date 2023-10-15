import crypto from "crypto";
import { ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { isHexString } from "ethjs-util";
import canonicalize from "canonicalize";

import { Lac1DID } from "@lacchain/did";
import { tryDecodeDomain } from "../domainType0001";
import VerificationRegistryAbi from "../VerificationRegistryAbi";
import { gasModelProvider } from "../../constants/blockchain";
import { filterP256JwkPublicKeysFromJwkAssertionKeys, resolve } from "../did";
import { sha256 } from "../cryptoUtils";
import {
  BLOCKCHAIN_TYPE1_POE,
  CREDENTIAL_PROOF_TIME,
  THROW_ON_NOT_FOUND_KEY_ERROR,
} from "../../constants/env";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const base58 = require("base-x")(BASE58);

/**
 * Given a verifiable credential and a set of proofs associated to it, gets the first proof and verifies the VC.
 * A type 2 credential has: proof with "type" "DataIntegrityProof" (eht only one supported at at this time) and
 * optionaly a decodable "domain"
 * @param {*} vc
 * @param {*} proofArray
 * @returns
 */
export const type2VerifyCredential = async (vc, proofArray) => {
  if (!proofArray || !Array.isArray(proofArray) || proofArray.length === 0) {
    const message = "Invalid proof array";
    return {
      error: true,
      message,
      data: {},
    };
  }
  const r = await resolveProof(vc, proofArray[0]);
  return r;
};

export const isType2CredentialValidator = async (vc, proofArray) => {
  const invalidResponse = {
    error: false,
    message: undefined,
    data: {
      isType2Credential: false,
    },
  };
  if (!proofArray || !Array.isArray(proofArray) || proofArray.length === 0) {
    return invalidResponse;
  }
  const proof = proofArray[0]; // just taking the first element
  const { error } = tryDecodeDomain(proof.domain);
  if (error) {
    return invalidResponse;
  }
  const isVersion2 =
    vc["@context"] &&
    vc["@context"].find((el) => el === "https://www.w3.org/ns/credentials/v2");
  if (!isVersion2) {
    return invalidResponse;
  }
  return {
    error: false,
    message: undefined,
    data: {
      isType2Credential: true,
    },
  };
};

export const resolveProof = async (vc, proof) => {
  // cryptograhic signature verification
  const signatureResponse = await validateCredentialSignature(vc, proof);
  if (signatureResponse.error) {
    return {
      error: true,
      message: signatureResponse.message,
      data: {},
    };
  }

  // Revocation Status Check
  const credentialStatusResult = await resolveCredentialStatus(vc, proof);
  if (credentialStatusResult.error) {
    return {
      error: true,
      message: "resolveProof: " + credentialStatusResult.message,
      data: {},
    };
  }
  const isNotRevoked = !credentialStatusResult.data.isRevoked;

  // PoE
  const credentialExpirationResult = await verifyCredentialExpiration(
    vc,
    proof
  );
  if (credentialExpirationResult.error) {
    return {
      error: true,
      message: "resolveProof: " + credentialExpirationResult.message,
      data: {},
    };
  }
  const { onchainExists, isExpired } = credentialExpirationResult.data;
  return {
    error: false,
    data: {
      credentialExists: onchainExists,
      isNotRevoked,
      issuerSignatureValid: signatureResponse.data.issuerSignatureValid,
      additionalSigners: false,
      isNotExpired: !isExpired,
    },
  };
};

export const resolveCredentialStatus = async (vc, proof) => {
  const { error, data, message } = tryDecodeDomain(proof.domain);
  if (error) {
    return {
      error,
      message,
      data: {},
    };
  }
  const hashDataResponse = computeCredentialHash(vc, proof);
  if (hashDataResponse.error) {
    return hashDataResponse;
  }
  const hashData = hashDataResponse.data.hashDatDigest;

  const issuerResult = await resolveIssuerDetailsFromVerificationMethod(
    proof.verificationMethod
  );
  if (issuerResult.error) {
    return {
      error: true,
      message: "resolveCredentialStatus: " + issuerResult.message,
      data: {},
    };
  }

  if (issuerResult.data.type !== "lac1") {
    return {
      error: true,
      message:
        "resolveCredentialStatus: Unsupported issuer type: " +
        issuerResult.data.type,
      data: {},
    };
  }
  const issuerAddress = issuerResult.data.details.address;
  const verificationRegistryDetailsResponse =
    await getDetailsFromVerificationRegistry(
      data.verificationRegistryContractAddress,
      issuerAddress,
      "0x" + hashData
    );
  if (verificationRegistryDetailsResponse.error) {
    return verificationRegistryDetailsResponse;
  }
  // TODO: if on-hold is true the use it in the UI to show the credential is under observation
  const { isRevoked, onHold } = verificationRegistryDetailsResponse.data;
  return {
    error: false,
    message: undefined,
    data: {
      isRevoked,
      onHold,
    },
  };
};

export const verifyCredentialExpiration = async (vc, proof) => {
  const onchainTimeDetailsResult = await resolveOnchainTimeDetails(vc, proof);
  let isExpired = true;
  let onchainExists = false;
  if (onchainTimeDetailsResult.error) {
    if (BLOCKCHAIN_TYPE1_POE) {
      return {
        error: true,
        message:
          "verifyCredentialExpiration: " + onchainTimeDetailsResult.error,
        data: {},
      };
    }
    if (proof && proof.expires) {
      try {
        const proofExpirationTime = Math.floor(
          new Date(proof.expires).getTime() / 1000
        );
        isExpired =
          proofExpirationTime < Math.floor(new Date().getTime() / 1000);
      } catch (e) {
        return {
          error: true,
          message: "Invalid 'expires' attribute value found in proof",
          data: {},
        };
      }
    } else {
      isExpired = false;
    }
  } else {
    const time = onchainTimeDetailsResult.data.time;
    const exp = onchainTimeDetailsResult.data.exp;
    onchainExists = time > 0;
    if (proof && proof.expires) {
      try {
        const proofExpirationTime = Math.floor(
          new Date(proof.expires).getTime() / 1000
        );
        const expirationTime =
          exp < proofExpirationTime && exp > 0 ? exp : proofExpirationTime; // omits non-expiring case when am expiration date is set in the proof
        isExpired = expirationTime < Math.floor(new Date().getTime() / 1000);
      } catch (e) {
        return {
          error: true,
          message: "Invalid 'expires' attribute value found in proof",
          data: {},
        };
      }
    } else {
      isExpired = exp > 0 && time < Math.floor(new Date().getTime() / 1000);
    }
  }
  return {
    error: false,
    message: undefined,
    data: {
      isExpired,
      onchainExists,
    },
  };
};
// TODO: handle errors better
/**
 * Checks whether the signature associated with the passed proof is correct or not.
 * @param {any} vc
 * @param {any} proof
 * @returns
 */
export const validateCredentialSignature = async (vc, proof) => {
  // resolving public key candidates from DidDocument
  // TODO: validate resolution is made against the right resolver
  const isVerificationMethod = proof.verificationMethod;
  if (!isVerificationMethod) {
    const message = "verification method not found in proof";
    return {
      error: true,
      message,
      data: {},
    };
  }

  // by defult resolves for time= currentTime
  let resolvedPublicKeyResponse = await resolvePublicKeyFromVerificationMethod(
    proof.verificationMethod
  );
  if (resolvedPublicKeyResponse.error) {
    const message =
      "Error resolving issuer response: " + resolvedPublicKeyResponse.error;
    return {
      error: true,
      message,
      data: {},
    };
  }

  if (!resolvedPublicKeyResponse.data.found) {
    let time;
    if (THROW_ON_NOT_FOUND_KEY_ERROR) {
      return {
        error: false,
        message: undefined,
        data: {
          isValidSignature: false,
        },
      };
    } else if (BLOCKCHAIN_TYPE1_POE) {
      const onchainTimeDetailsResult = await resolveOnchainTimeDetails(
        vc,
        proof
      );
      if (onchainTimeDetailsResult.error) {
        return {
          error: true,
          message:
            "validateCredentialSignature: " + onchainTimeDetailsResult.error,
          data: {},
        };
      }
      time = onchainTimeDetailsResult.data.time;
    } else if (CREDENTIAL_PROOF_TIME && proof.created) {
      try {
        time = Math.floor(new Date(proof.created).getTime() / 1000);
      } catch (e) {
        return {
          error: true,
          message: "validateCredentialSignature: " + e.message,
          data: {},
        };
      }
    }
    if (!time) {
      return {
        error: false,
        message: undefined,
        data: {
          isValidSignature: false,
        },
      };
    }
    resolvedPublicKeyResponse = await resolvePublicKeyFromVerificationMethod(
      proof.verificationMethod,
      time
    );
    if (resolvedPublicKeyResponse.error) {
      const message =
        "Error resolving issuer response: " + resolvedPublicKeyResponse.error;
      return {
        error: true,
        message,
        data: {},
      };
    }
    if (!resolvedPublicKeyResponse.data.found) {
      return {
        error: false,
        message: undefined,
        data: {
          isValidSignature: false,
        },
      };
    }
  }

  const publicKey = resolvedPublicKeyResponse.data.key;
  try {
    if (proof.cryptosuite && proof.cryptosuite === "ecdsa-jcs-2019") {
      const res = await verifyEcdsaJcs2019ProofSignature(vc, proof, publicKey);
      return res;
    }
    return {
      error: true,
      message: "Proof doesn't have 'cryptosuite' property",
      data: {},
    };
  } catch (e) {
    return {
      error: true,
      message: "Error while verifying Signature: " + e.message,
      data: {},
    };
  }
};

const computeCredentialHash = (vc, proof) => {
  if (proof && proof.cryptosuite && proof.cryptosuite === "ecdsa-jcs-2019") {
    return computeEcdsaJcs2019CredentialHash(vc, proof);
  }
  return {
    error: true,
    message:
      "Unsupported credential, not able to found suitable hash creation process",
    data: {},
  };
};

/**
 * Only works with Gas Model based contracts.
 * @param {*} verificationRegistryAddress
 */
export const getDetailsFromVerificationRegistry = async (
  verificationRegistryAddress,
  identityAddress,
  hash
) => {
  if (
    !(
      isAddress(verificationRegistryAddress) &&
      isAddress(identityAddress) &&
      isHexString(hash.startsWith("0x") ? hash : "0x" + hash)
    )
  ) {
    const message = "Invalid params identityAddress/hash";
    return {
      error: true,
      message,
      data: {},
    };
  }
  const providerResponse = gasModelProvider();
  if (providerResponse.error) {
    return {
      error: true,
      message: providerResponse.message,
      data: {},
    };
  }
  const verificationRegistryContractInstance = new ethers.Contract(
    verificationRegistryAddress,
    VerificationRegistryAbi.abi,
    providerResponse.data.provider
  );
  const verificationRegistryVersion =
    await verificationRegistryContractInstance.version();
  if (verificationRegistryVersion.toString() !== "1") {
    const message = "INFO:: Verification Registry Version not supported: ";
    console.log(message, verificationRegistryVersion);
    return {
      error: true,
      message,
      data: {},
    };
  }

  const details = await verificationRegistryContractInstance.getDetails(
    identityAddress,
    hash
  );
  const iat = parseInt(ethers.utils.formatUnits(details.iat, 0));
  const exp = parseInt(ethers.utils.formatUnits(details.exp, 0));
  const onHold = details.onHold ? true : false;
  const isRevoked = details.isRevoked ? true : false;
  return {
    error: false,
    message: undefined,
    data: {
      iat,
      exp,
      onHold,
      isRevoked,
    },
  };
};

const resolvePublicKeyFromVerificationMethod = async (
  verificationMethod,
  time = Math.floor(new Date().getTime() / 1000)
) => {
  const issuerResult = await resolveIssuerFromVerificationMethod(
    verificationMethod
  );
  if (issuerResult.error) {
    return {
      error: true,
      message:
        "resolvePublicKeyFromVerificationMethod: " + issuerResult.message,
      data: {},
    };
  }
  const did = issuerResult.data.did;
  let matchingAssertionKey;
  try {
    const didDocument = await resolve(did);
    matchingAssertionKey = filterP256JwkPublicKeysFromJwkAssertionKeys(
      didDocument,
      "JsonWebKey2020"
    ).find((el) => el.id === verificationMethod);
    if (!matchingAssertionKey) {
      return {
        error: false,
        message: undefined,
        data: {
          found: false,
          type: undefined,
          key: undefined,
        },
      };
    }
  } catch (e) {
    const message =
      "There was an error while trying to public key from didDocument";
    return {
      error: true,
      message,
      data: {},
    };
  }
  return {
    error: false,
    message: undefined,
    data: {
      found: true,
      type: "jwk",
      key: matchingAssertionKey,
    },
  };
};

const resolveOnchainTimeDetails = async (vc, proof) => {
  const decodedDomainResult = tryDecodeDomain(proof.domain);
  if (decodedDomainResult.error) {
    return {
      error: true,
      message: "resolveOnchainTimeDetails: " + decodedDomainResult.message,
      data: {},
    };
  }
  const { verificationRegistryContractAddress } = decodedDomainResult.data;
  if (proof && proof.cryptosuite === "ecdsa-jcs-2019") {
    const ecdsaJcs2019CredentialHashResult = computeEcdsaJcs2019CredentialHash(
      vc,
      proof
    );
    if (ecdsaJcs2019CredentialHashResult.error) {
      const message =
        "Error computing ecdsa JCS2019 credential hash/digest: " +
        ecdsaJcs2019CredentialHashResult.message;
      return {
        error: true,
        message,
        data: {},
      };
    }
    const digest = "0x" + ecdsaJcs2019CredentialHashResult.data.hashDatDigest;

    const issuerResult = await resolveIssuerDetailsFromVerificationMethod(
      proof.verificationMethod
    );
    if (issuerResult.error) {
      return {
        error: true,
        message: "resolveOnchainTimeDetails: " + issuerResult.message,
        data: {},
      };
    }

    if (issuerResult.data.type !== "lac1") {
      return {
        error: true,
        message: "Unsupported issuer type: " + issuerResult.data.type,
        data: {},
      };
    }
    const issuerAddress = issuerResult.data.details.address;
    const vrDetailsResult = await getDetailsFromVerificationRegistry(
      verificationRegistryContractAddress,
      issuerAddress,
      digest
    );
    if (vrDetailsResult.error) {
      return {
        error: true,
        message: "resolveOnchainTimeDetails: " + vrDetailsResult.message,
        data: {},
      };
    }
    const vrDetails = vrDetailsResult.data;
    const isOnchainExpired =
      vrDetails.iat > 0 &&
      vrDetails.exp < Math.floor(new Date().getTime() / 1000);
    const time = vrDetails.iat;
    const exp = vrDetails.exp;
    return {
      error: false,
      message: undefined,
      data: {
        isOnchainExpired,
        time,
        exp,
      },
    };
  }
  return {
    error: true,
    message: "unsupported cryptosuite",
    data: {},
  };
};

const computeEcdsaJcs2019CredentialHash = (vc, proof) => {
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
  return {
    error: false,
    message: undefined,
    data: {
      hashData,
      hashDatDigest: sha256(hashData),
    },
  };
};

const verifyEcdsaJcs2019ProofSignature = async (vc, proof, publicKey) => {
  const hashDataResponse = computeEcdsaJcs2019CredentialHash(vc, proof);
  if (hashDataResponse.error) {
    return hashDataResponse;
  }
  const hashData = hashDataResponse.data.hashData;
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

  try {
    console.log("pub key to verify: " + JSON.stringify(publicKey.publicKeyJwk));
    const subtle = window.crypto.subtle;
    const importedKey = await subtle.importKey(
      "jwk",
      publicKey.publicKeyJwk,
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
    return {
      error: false,
      data: {
        issuerSignatureValid: result,
      },
    };
  } catch (e) {
    return {
      error: true,
      message: "Unable to verify ecdsa-jcs-2019 proof",
      data: {},
    };
  }
};

const resolveIssuerFromVerificationMethod = async (verificationMethod) => {
  try {
    const did = verificationMethod.substring(
      0,
      verificationMethod.indexOf("#")
    );
    return {
      error: false,
      message: undefined,
      data: {
        did,
      },
    };
  } catch (e) {
    return {
      error: true,
      message: "Error resolving issuer from verification method",
      data: {},
    };
  }
};

const resolveIssuerDetailsFromVerificationMethod = async (
  verificationMethod
) => {
  const issuerResult = await resolveIssuerFromVerificationMethod(
    verificationMethod
  );
  if (issuerResult.error) {
    return {
      error: true,
      message:
        "resolveIssuerDetailsFromVerificationMethod: " + issuerResult.message,
      data: {},
    };
  }

  try {
    const issuer = Lac1DID.decodeDid(issuerResult.data.did);
    return {
      error: false,
      message: undefined,
      data: {
        type: "lac1",
        details: issuer,
      },
    };
  } catch (e) {
    return {
      error: true,
      message: "resolveIssuerDetailsFromVerificationMethod: " + e.message,
      data: {},
    };
  }
};

export const getDidFromVerificationMethod = (verificationMethod) => {
  const vmParts = verificationMethod.split("#vm");
  if (vmParts && vmParts.length > 0) {
    const didCandidate = vmParts[0];
    if (didCandidate && didCandidate.startsWith("did:lac1:")) {
      return {
        error: false,
        message: undefined,
        data: {
          did: didCandidate,
        },
      };
    }
  }

  return {
    error: true,
    message: "Unable to get did from verification method",
    data: {},
  };
};
