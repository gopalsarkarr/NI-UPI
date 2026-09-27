import crypto from 'crypto';

/**
 * Holds the backend server's RSA-2048 keypair.
 * Generated on startup (in production, loaded from AWS KMS, HashiCorp Vault, or PEM env var).
 */
class ServerKeyHolder {
  constructor() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    this.publicKeyPem = publicKey;
    this.privateKeyPem = privateKey;

    // Also extract clean DER / Base64 format for mobile/client consumption
    const cleanBase64 = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s+/g, '');
    this.publicKeyBase64 = cleanBase64;
  }

  getPublicKey() {
    return this.publicKeyPem;
  }

  getPrivateKey() {
    return this.privateKeyPem;
  }

  getPublicKeyBase64() {
    return this.publicKeyBase64;
  }
}

export const serverKeyHolder = new ServerKeyHolder();
