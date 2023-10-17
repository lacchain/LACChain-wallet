import sodium from 'libsodium-wrappers';
import crypto from 'crypto';

export function encrypt(plain, key) {
  const cipher = crypto.createCipher('aes256', key);
  return cipher.update(plain, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(encrypted, key) {
  const decipher = crypto.createDecipher('aes256', key);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

export const getKeyPairFromHex = (keyPairHex) => ({
  keyType: 'ed25519',
  publicKey: sodium.from_hex(keyPairHex.publicKey),
  privateKey: sodium.from_hex(keyPairHex.privateKey),
});
