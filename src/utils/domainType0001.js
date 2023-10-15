import { keccak256 } from "ethereumjs-util";
import { ethers } from "ethers";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const base58 = require("base-x")(BASE58);

export function sha256(data) {
  const hashFn = crypto.createHash("sha256");
  hashFn.update(data);
  return hashFn.digest("hex");
}
/**
 * Computes the keccak256 hash and returns the first 4 bytes of the digest
 * @param {Buffer} payload
 * @returns {Buffer} first 4 bytes of keccak256
 */
export const checksum = (payload) => {
  return Buffer.from(keccak256(Buffer.from(payload))).subarray(0, 4);
};

/**
 * Returns the following structure:
{
    error: boolean, message: string, data: {
        verificationRegistryContractAddress: string,
        publicDirectoryContractAddress: string,
        chainOfTrustContractAddress: string,
        chainId: string
      }
    }
  }
 * At the time just supporting just first version ("0001") of domain type "0001"
 * @param {string} domain -  Base58 of encoded data
 * @returns
 *    
 */
export const tryDecodeDomain = (domain) => {
  try {
    const data = Buffer.from(base58.decode(domain));
    const len = data.length;
    const encodedPayload = data.subarray(0, len - 4);
    const computedChecksum = checksum(encodedPayload);

    const checksumToVerify = Buffer.from(data.subarray(len - 4, len));
    if (!Buffer.from(computedChecksum).equals(checksumToVerify)) {
      const message = "Checksum mismatch";
      console.log(message);
      // TODO: handle
      return {
        error: true,
        message,
        data: {},
      };
    }
    const specificTypeVersion = Buffer.from(data.subarray(0, 2)).toString(
      "hex"
    );
    const specificType = Buffer.from(data.subarray(2, 4)).toString("hex");
    if (!(specificTypeVersion === "0001" && specificType === "0001")) {
      const message =
        "unsupported domain specific type/domain specific type version: " +
        specificType +
        specificTypeVersion;
      console.log(message);
      return {
        error: true,
        message,
        data: {},
      };
    }
    const verificationRegistryContractAddress = ethers.utils.getAddress(
      "0x" + Buffer.from(data.subarray(4, 24)).toString("hex")
    );
    const publicDirectoryContractAddress = ethers.utils.getAddress(
      "0x" + Buffer.from(data.subarray(24, 44)).toString("hex")
    );
    const chainOfTrustContractAddress = ethers.utils.getAddress(
      "0x" + Buffer.from(data.subarray(44, 64)).toString("hex")
    );
    const fullChainId = Buffer.from(data.subarray(64, len - 4)).toString("hex");
    const chainId =
      "0x" +
      (fullChainId.startsWith("0") ? fullChainId.substring(1) : fullChainId);
    return {
      error: false,
      message: null,
      data: {
        verificationRegistryContractAddress,
        publicDirectoryContractAddress,
        chainOfTrustContractAddress,
        chainId,
      },
    };
  } catch (e) {
    const message = "Error decoding domain: ";
    // TODO: handle with error view
    return {
      error: true,
      message,
      data: {},
    };
  }
};
