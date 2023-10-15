import canonicalize from "canonicalize";
import crypto from "crypto";
import {
  DEFAULT_CHAIN_OF_TRUST_CONTRACT_ADDRESS,
  DEFAULT_PUBLIC_DIRECTORY_CONTRACT_ADDRESS,
  DEFAULT_VERIFICATION_REGISTRY_CONTRACT_ADDRESS,
  DOMAIN_TYPE,
  DOMAIN_VERSION,
  SUPPORTED_CHAIN_ID,
} from "../../constants/env";
import { checksum } from "../domainType0001";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const base58 = require("base-x")(BASE58);

const hex = require("base-x")("0123456789abcdef");

export const registerType2Credential = async (
  unsecuredDocument,
  proofConfig,
  jwkSigningKey
) => {
  const hashData = computeEcdsaJcs2019CredentialHash(
    unsecuredDocument,
    proofConfig
  );

  const subtle = window.crypto.subtle;
  const importedKey = await subtle.importKey(
    "jwk",
    jwkSigningKey,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );
  const result = await subtle.sign(
    { name: "ECDSA", namedCurve: "P-256", hash: { name: "SHA-256" } },
    importedKey,
    Buffer.from(hashData.hash.replace("0x", ""), "hex")
  );
  const proof = {
    ...proofConfig,
    proofValue: base58.encode(Buffer.from(result)),
  };
  return {
    error: false,
    message: undefined,
    data: {
      verifiableCredential: {
        ...unsecuredDocument,
        proof,
      },
    },
  };
};

export const computeEcdsaJcs2019CredentialHash = (
  unsecuredDocument,
  proofConfig
) => {
  const canonicalDocumentHash = computeRfc8785AndSha256(
    unsecuredDocument
  ).replace("0x", "");
  const proofConfigHash = computeRfc8785AndSha256(proofConfig).replace(
    "0x",
    ""
  );
  const credentialHash = proofConfigHash.concat(canonicalDocumentHash);
  const digest =
    "0x" + crypto.createHash("sha256").update(credentialHash).digest("hex");
  return { hash: credentialHash, digest };
};

export const computeRfc8785AndSha256 = (data) => {
  const canonizedData = canonicalize(data);
  const message = "Error canonicalizing data";
  if (!canonizedData) {
    return {
      error: true,
      message,
      data: {},
    };
  }
  return "0x" + crypto.createHash("sha256").update(canonizedData).digest("hex");
};

export const getUtcDate = (t = new Date()) => {
  const y = t.getUTCFullYear();
  const month = getTwoDigitFormat(t.getUTCMonth() + 1);
  const d = getTwoDigitFormat(t.getUTCDate());
  const h = getTwoDigitFormat(t.getUTCHours());
  const m = getTwoDigitFormat(t.getUTCMinutes());
  const s = getTwoDigitFormat(t.getUTCSeconds());
  return `${y}-${month}-${d}T${h}:${m}:${s}Z`;
};

export const getTwoDigitFormat = (el) => {
  if (el < 10) {
    return "0".concat(el.toString());
  }
  return el.toString();
};

export const encodeDomain = () => {
  const publicDirectoryContractAddress =
    DEFAULT_PUBLIC_DIRECTORY_CONTRACT_ADDRESS;
  const chainOfTrustContractAddress = DEFAULT_CHAIN_OF_TRUST_CONTRACT_ADDRESS;
  const verificationRegistryContractAddress =
    DEFAULT_VERIFICATION_REGISTRY_CONTRACT_ADDRESS;
  const chainIdBuffer = hex.decode(SUPPORTED_CHAIN_ID.replace("0x", ""), "hex");
  const payload = [
    Buffer.from(DOMAIN_VERSION.replace("0x", ""), "hex"),
    Buffer.from(DOMAIN_TYPE.replace("0x", ""), "hex"),
    Buffer.from(verificationRegistryContractAddress.replace("0x", ""), "hex"),
    Buffer.from(publicDirectoryContractAddress.replace("0x", ""), "hex"),
    Buffer.from(chainOfTrustContractAddress.replace("0x", ""), "hex"),
    chainIdBuffer,
  ];
  const calculatedChecksum = checksum(Buffer.concat(payload));
  payload.push(Buffer.from(calculatedChecksum));
  return base58.encode(Buffer.concat(payload));
};
