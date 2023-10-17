import { ethers } from 'ethers';
import ChainOfTrustAbi from '../ChainOfTrustAbi';
import { gasModelProvider } from '../../constants/blockchain';
import { findDelegationKeys, resolve } from '../did';

/**
 * Resolves the chain of trust living at an ethereum based network whose chainId is 'chainId'
 * given an entity identified with 'id'
 * @param {string} chainOfTrustContractAddress
 * @param {string} chainId
 * @param {string} id - Typically a decentralized identifier (did)
 * @returns
 */
export const resolveChainOfTrust = async (
  chainOfTrustContractAddress,
  chainId,
  id,
) => {
  const managerCandidatesResponse = await getManagersCandidates(id);
  if (managerCandidatesResponse.error) {
    return {
      error: true,
      message: managerCandidatesResponse.message,
      data: {},
    };
  }
  const managerCandidates = managerCandidatesResponse.data.managerCandidateKeys;
  // loop through the candidates
  let trustTree = [];
  for (const managerCandidate of managerCandidates) {
    const cotResponseFromEntityManager = await getChainOfTrustFromEntityManager(
      managerCandidate,
      chainOfTrustContractAddress,
      chainId,
    );
    if (cotResponseFromEntityManager.error) {
      return {
        error: true,
        message: cotResponseFromEntityManager.message,
        data: {},
      };
    }
    if (cotResponseFromEntityManager.data.trustTree.length === 0) {
      trustTree = []; // resetting to an empty array since the validation failed for that candidate
      continue;
    }

    trustTree = cotResponseFromEntityManager.data.trustTree;

    return {
      error: false,
      message: null,
      data: {
        trustTree,
      },
    };
  }
  return {
    error: false,
    message: null,
    data: {
      trustTree: [],
    },
  };
};

export const getChainOfTrustFromEntityManager = async (
  managerCandidate,
  chainOfTrustContractAddress,
  chainId,
) => {
  const providerResponse = gasModelProvider(chainId);
  if (providerResponse.error) {
    return {
      error: true,
      message: providerResponse.message,
      data: {},
    };
  }
  const chainOfTrustContractInstance = new ethers.Contract(
    chainOfTrustContractAddress,
    ChainOfTrustAbi.abi,
    providerResponse.data.provider,
  );

  let trustedBy = managerCandidate;
  let iter = 0;
  const reversedTrustTree = [];

  // limiting since it is not optimized to make multiple calls
  while (iter < 4) {
    console.log('INFO:: Getting Root; teration #', iter + 1);
    let r;
    try {
      r = await chainOfTrustContractInstance.getMemberDetailsByEntityManager(
        trustedBy,
      );
    } catch (e) {
      const message = `There was an error getting the chain of trust: ${e.message}`;
      return {
        error: true,
        message,
        data: {},
      };
    }
    if (!r.isValid) {
      return {
        error: false,
        message: undefined,
        data: {
          reversedTrustTree: [],
        },
      };
    }

    /// / push
    const trustElement = {
      valid: true,
      address: r.did,
    };
    reversedTrustTree.push(trustElement);
    trustedBy = r.trustedBy;
    if (r.trustedBy === ethers.constants.AddressZero) {
      break;
    }
    iter++;
  }
  return {
    error: false,
    message: undefined,
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
    'EcdsaSecp256k1RecoveryMethod2020',
  ).map((delegationKey) => `0x${Buffer.from(delegationKey).toString('hex')}`);
  if (delegationKeys.length > 5) {
    return {
      error: true,
      message: 'Too many delegation keys to process',
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
