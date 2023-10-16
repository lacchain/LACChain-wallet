import { ethers } from 'ethers';
import { gasModelProvider } from '../../constants/blockchain';
import PublicDirectoryAbi from '../PublicDirectoryAbi';
import { SUPPORTED_PUBLIC_DIRECTORY_VERSION } from '../../constants/env';

/**
 * Retrieves and returns all data pertaining to an entity whose identifier is `id`
 * @param {string} chainId
 * @param {string} publicDirectoryContractAddress
 * @param {string} id - e.g. a decentralized identifier (did)
 * @returns
 */
export const getPublicDirectoryMember = async (
  publicDirectoryContractAddress,
  id,
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
  // TODO: check against a list of registered PDs by this application
  const publicDirectoryContractInstance = new ethers.Contract(
    publicDirectoryContractAddress,
    PublicDirectoryAbi.abi,
    providerResponse.data.provider,
  );
  const publicDirectoryVersion = await publicDirectoryContractInstance.version(); //  TODO: catch
  if (
    publicDirectoryVersion.toString() !== SUPPORTED_PUBLIC_DIRECTORY_VERSION
  ) {
    const message = 'Public Directory Version not supported';
    console.log(`INFO:: ${message} : `, publicDirectoryVersion);
    return {
      error: true,
      message,
      data: {},
    };
  }
  if (!id) {
    const message = 'member identifier (e.g. did) not provided';
    return {
      error: true,
      message,
      data: {},
    };
  }
  const member = await publicDirectoryContractInstance.getMemberDetails(id);
  const details = member.memberData;
  const iat = parseInt(ethers.utils.formatUnits(details.iat, 0));
  const exp = parseInt(ethers.utils.formatUnits(details.exp, 0));
  const { expires } = details;
  const currentTime = Math.floor(Date.now() / 1000);
  if (iat === 0 || (expires === true && exp < currentTime)) {
    console.log('INFO:: Member has expired or is no longer valid');
    return {
      error: false,
      data: {
        isMember: false,
      },
    };
  }

  const lastBlockChange = parseInt(
    ethers.utils.formatUnits(member.lastBlockChange, 0),
  );
  // TODO: resolve member data from last block change
  const memberData = await getMemberData(
    lastBlockChange,
    id,
    publicDirectoryContractAddress,
  );
  if (memberData.error) {
    return {
      error: true,
      data: {},
    };
  }
  const memberIdentificationDetails = memberData.data;
  const legalName = memberIdentificationDetails
    && memberIdentificationDetails.identificationData
    && memberIdentificationDetails.identificationData.legalName
    ? memberIdentificationDetails.identificationData.legalName
    : null;
  const alpha3CountryCode = memberIdentificationDetails
    && memberIdentificationDetails.identificationData
    && memberIdentificationDetails.identificationData.countryCode
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
// TODO: handle external call
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
  publicDirectoryContractAddress,
) => {
  const providerResponse = gasModelProvider();
  if (providerResponse.error) {
    return {
      error: true,
      message: providerResponse.message,
      data: {},
    };
  }
  try {
    const publicDirectoryContractInstance = new ethers.Contract(
      publicDirectoryContractAddress,
      PublicDirectoryAbi.abi,
      providerResponse.data.provider,
    );

    const data = await publicDirectoryContractInstance.queryFilter(
      'MemberChanged',
      blockNumber,
      blockNumber,
    );
    const found = data.find(
      (log) => log.address.toLocaleLowerCase()
        === publicDirectoryContractAddress.toLocaleLowerCase(),
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
    const { rawData } = found.args;
    const decodedFromHex = Buffer.from(
      rawData.replace('0x', ''),
      'hex',
    ).toString();
    const parsedData = JSON.parse(decodedFromHex);
    // TODO: define association between type and version better in regards to a certain public directory metaclass
    return {
      error: false,
      message: null,
      data: parsedData,
    };
  } catch (err) {
    const message = 'There was an error while retrieving data for the member being queried';
    console.log('Error::', message, err);
    return {
      error: true,
      message,
      data: {},
    };
  }
};

export const resolveEntityNameFromPublicDirectory = async (
  publicDirectoryContractAddress,
  id,
  chainId,
) => {
  const pdMemberResponse = await getPublicDirectoryMember(
    publicDirectoryContractAddress,
    id,
    chainId,
  );
  if (pdMemberResponse.error) {
    return {
      error: true,
      message:
        `resolveEntityNameFromPublicDirectory: ${pdMemberResponse.message}`,
      data: {},
    };
  }
  let name;
  if (pdMemberResponse.data.isMember && pdMemberResponse.data.legalName) {
    name = pdMemberResponse.data.legalName;
  }
  return {
    error: false,
    message: undefined,
    data: {
      isName: !!name,
      name,
    },
  };
};
