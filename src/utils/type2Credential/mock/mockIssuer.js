import { Lac1DID } from '@lacchain/did';
import canonicalize from 'canonicalize';
import { toUtf8Bytes } from 'ethers/lib/utils';
import {
  LAC1_DID_REGISTRY,
  LAC_DID_NETWORK_IDENTIFIER,
  NODE_ADDRESS,
  RPC_URL,
} from '../../../constants/env';
import { LAC1_CHAIN_ID } from '../../../constants/blockchain';

export const createMockedIssuer = async () => {
  try {
    const did = await Lac1DID.new({
      registry: LAC1_DID_REGISTRY,
      rpcUrl: RPC_URL,
      network: LAC_DID_NETWORK_IDENTIFIER,
      nodeAddress: NODE_ADDRESS,
      expiration: Math.floor(new Date().getTime() / 1000) + 3600 * 24 * 5,
      chainId: LAC1_CHAIN_ID,
    });
    // generate p256 public key
    const { subtle } = window.crypto;
    const p256Key = await subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify'],
    );
    const jwk = await subtle.exportKey('jwk', p256Key.publicKey);
    const privJwk = await subtle.exportKey('jwk', p256Key.privateKey);
    const jwkCanon = canonicalize(jwk);
    const pubKey = toUtf8Bytes(jwkCanon);
    const stringnifiedPublicKey = Buffer.from(pubKey).toString('hex');

    await did.addAssertionMethod({
      algorithm: 'jwk',
      encoding: 'json',
      publicKey: `0x${stringnifiedPublicKey}`,
      controller: did.address,
    });
    return {
      error: false,
      message: undefined,
      data: {
        did: did.id,
        signingKey: privJwk,
      },
    };
  } catch (e) {
    return {
      error: true,
      message: `Error while creating mocked issuer: ${e.message}`,
    };
  }
};
