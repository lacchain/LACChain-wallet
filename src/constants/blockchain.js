import { GasModelProvider } from "@lacchain/gas-model-provider";
import { ethers } from "ethers";
import { LEGACY_PROVIDER_PRC_URL, RPC_URL, SUPPORTED_CHAIN_ID } from "./env";
export const gasModelProvider = (chainId = SUPPORTED_CHAIN_ID) => {
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
  return {
    error: false,
    message: undefined,
    data: {
      provider: new GasModelProvider(RPC_URL),
    },
  };
}; // TODO: move to env
export const legacyProvider = new ethers.providers.JsonRpcProvider(
  LEGACY_PROVIDER_PRC_URL
);

export const verifyChainId = (chainId) => {
  const message = "Unsupported chain";
  try {
    if (
      chainId &&
      chainId.toLowerCase().replace("0x", "") ===
        SUPPORTED_CHAIN_ID.toLowerCase().replace("0x", "")
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
