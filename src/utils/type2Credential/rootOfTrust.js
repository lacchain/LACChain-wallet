import { ethers } from "ethers";
import { resolveEntityNameFromPublicDirectory } from "./PublicDirectory";
import { tryDecodeDomain } from "../domainType0001";
import { resolveChainOfTrust } from "./chainOfTrust";

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
    const chainOfTrustResponse = await resolveRootOfTrust(
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

/**
 * Starting from a did and an a chain of trust contract address, iterates
 * over did-document to find a delegation key that checked against the chain of trust
 * can return true.
 * @param {string} chainOfTrustContractAddress
 * @param {string} publicDirectoryContractAddress
 * @param {string} chainId - hex string of the chain Id
 * @param {string} id - Typically a decentralized identifier (did)
 */
export const resolveRootOfTrust = async (
  chainOfTrustContractAddress,
  publicDirectoryContractAddress,
  chainId,
  id
) => {
  const cotResponse = await resolveChainOfTrust(
    chainOfTrustContractAddress,
    chainId,
    id
  );
  if (cotResponse.error) {
    const message =
      "There was an error resolving the chain of trust: " + cotResponse.message;
    return {
      error: true,
      message,
      data: {},
    };
  }

  const cotPath = cotResponse.data.trustTree;
  const rot = [];

  for (const member of cotPath) {
    const did = member.address;

    const entityNameByPublicDirectoryResponse =
      await resolveEntityNameFromPublicDirectory(
        publicDirectoryContractAddress,
        did
      );
    if (entityNameByPublicDirectoryResponse.error) {
      console.log(
        "getRootOfTrust: " + entityNameByPublicDirectoryResponse.message
      );
      return {
        error: true,
        message: entityNameByPublicDirectoryResponse.message,
        data: {},
      };
    }
    let name = entityNameByPublicDirectoryResponse.data.name;
    rot.push({ ...member, name });
  }

  return {
    error: false,
    message: null,
    data: {
      trustTree: rot,
    },
  };
};
