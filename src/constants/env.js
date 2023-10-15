export const SUPPORTED_CHAIN_ID = "0x9e55c";
export const LEGACY_PROVIDER_PRC_URL = "https://writer.lacchain.net";
export const RPC_URL = "https://writer-openprotest.lacnet.com";
export const NODE_ADDRESS = "0xad730de8c4bfc3d845f7ce851bcf2ea17c049585";
export const SUPPORTED_PUBLIC_DIRECTORY_VERSION = "1";
export const BLOCKCHAIN_TYPE1_POE = process.env.REACT_APP_BLOCKCHAIN_TYPE1_POE;
export const THROW_ON_NOT_FOUND_KEY_ERROR =
  process.env.REACT_APP_THROW_ON_NOT_FOUND_KEY_ERROR;
export const CREDENTIAL_PROOF_TIME =
  process.env.REACT_APP_CREDENTIAL_PROOF_TIME;
export const LAC1_DID_REGISTRY = "0xb4FB2e9BB0001cc8eAAE528571915F35Cb74C864";
export const LAC_DID_REGISTTRY = "0xAB00e74C1b0A2313f552E869E6d55B5CdA31aFfe";
export const LAC_DID_NETWORK_IDENTIFIER = "openprotest"; // 'openprotest' or 'main'
export const LAC1_CHAIN_ID = 648540;
export const MAILBOX_SERVICE = "https://mailbox.openprotest.lacnet.com";
export const MAILBOX_DID =
  "did:lac:openprotest:0xf33bc23691245c2d5de99d7d45e9fdd113495870";
export const DEFAULT_PUBLIC_DIRECTORY_CONTRACT_ADDRESS =
  "0xbBbfDe862725186E3D5332618a5546e60fcB75e6";
export const PUBLIC_DIRECTORY_CONTRACT_ADDRESS = (() => {
  return ["0xbBbfDe862725186E3D5332618a5546e60fcB75e6"];
})();

export const DEFAULT_CHAIN_OF_TRUST_CONTRACT_ADDRESS =
  "0xFE7CEF0D8E9A1dab4C4F57154e0191d67D4803AF";
export const CHAIN_OF_TRUST_CONTRACT_ADDRESS = (() => {
  return ["0xFE7CEF0D8E9A1dab4C4F57154e0191d67D4803AF"];
})();

export const DEFAULT_VERIFICATION_REGISTRY_CONTRACT_ADDRESS =
  "0x64CaA0fC7E0C1f051078da9525A31D00dB1F50eE";

export const VERIFICATION_REGISTRY_CONTRACT_ADDRESS = (() => {
  return ["0x64CaA0fC7E0C1f051078da9525A31D00dB1F50eE"];
})();

export const DOMAIN_TYPE = "0001";
export const DOMAIN_VERSION = "0001";
