import { GasModelProvider } from "@lacchain/gas-model-provider";
import { ethers } from "ethers";
import { LEGACY_PROVIDER_PRC_URL, OPENPROTEST_PROVIDER_PRC_URL } from "./env";
export const gasModeProvider = new GasModelProvider(
  OPENPROTEST_PROVIDER_PRC_URL
); // TODO: move to env
export const legacyProvider = new ethers.providers.JsonRpcProvider(
  LEGACY_PROVIDER_PRC_URL
);
