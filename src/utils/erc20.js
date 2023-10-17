import { ethers } from 'ethers';
import { LEGACY_PROVIDER_PRC_URL } from '../constants/env';

const abi = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',
];

export async function getInfo(address) {
  const token = new ethers.Contract(address, abi, new ethers.providers.JsonRpcProvider(LEGACY_PROVIDER_PRC_URL));
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();

  return {
    name: await token.name(),
    decimals,
    totalSupply: totalSupply.div(decimals).toNumber(),
    symbol: await token.symbol(),
  };
}

export async function getBalance(address, account) {
  const token = new ethers.Contract(address, abi, new ethers.providers.JsonRpcProvider(LEGACY_PROVIDER_PRC_URL));
  return await token.balanceOf(account);
}

export async function sendTokens(address, privateKey, receiver, amount) {
  const token = new ethers.Contract(address, abi, new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(LEGACY_PROVIDER_PRC_URL)));
  return await token.transfer(receiver.replace(/.*:/, ''), amount);
}
