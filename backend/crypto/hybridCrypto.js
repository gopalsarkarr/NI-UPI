import crypto from 'crypto';
import { serverKeyHolder } from './keyHolder.js';

const RSA_ENCRYPTED_KEY_BYTES = 256; // 2048-bit RSA key produce 256 bytes
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;

/**
 * Hybrid encryption: RSA-OAEP (SHA-256) + AES-256-GCM.
 * Wire format:
 * [256 bytes RSA encrypted AES key] + [12 bytes IV] + [AES Ciphertext + 16-byte GCM Tag]
 * Base64 encoded for transport across mesh hops.
 */
export class HybridCryptoService {
  /**
   * Encrypt a payment instruction (simulates sender phone).
   * @param {Object} instruction
   * @param {string|KeyObject} [publicKey] - Optional; defaults to server's public key
   * @returns {string} Base64 encoded hybrid packet
   */
  static encrypt(instruction, publicKey = serverKeyHolder.getPublicKey()) {
    const plaintext = Buffer.from(JSON.stringify(instruction), 'utf8');

    // 1. Generate one-time 256-bit AES key and 12-byte IV
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(GCM_IV_BYTES);

    // 2. Encrypt plaintext with AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const encryptedPayload = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag(); // 16 bytes

    // In Java AES/GCM/NoPadding, the 16-byte tag is concatenated to the ciphertext
    const aesCiphertextWithTag = Buffer.concat([encryptedPayload, authTag]);

    // 3. Encrypt the 32-byte AES key using RSA-OAEP with SHA-256
    const encryptedAesKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      aesKey
    );

    // 4. Pack: [256 bytes encrypted key][12 bytes IV][Ciphertext + Tag]
    const packetBuffer = Buffer.concat([encryptedAesKey, iv, aesCiphertextWithTag]);

    return packetBuffer.toString('base64');
  }

  /**
   * Decrypt hybrid encrypted base64 ciphertext with server's private key.
   * Throws an error if any bit was tampered with (due to GCM auth tag check).
   * @param {string} base64Ciphertext
   * @param {string|KeyObject} [privateKey] - Optional; defaults to server private key
   * @returns {Object} Decrypted payment instruction
   */
  static decrypt(base64Ciphertext, privateKey = serverKeyHolder.getPrivateKey()) {
    const buffer = Buffer.from(base64Ciphertext, 'base64');

    const minLength = RSA_ENCRYPTED_KEY_BYTES + GCM_IV_BYTES + GCM_TAG_BYTES;
    if (buffer.length < minLength) {
      throw new Error('Ciphertext too short');
    }

    // Unpack components
    const encryptedAesKey = buffer.subarray(0, RSA_ENCRYPTED_KEY_BYTES);
    const iv = buffer.subarray(RSA_ENCRYPTED_KEY_BYTES, RSA_ENCRYPTED_KEY_BYTES + GCM_IV_BYTES);
    const aesData = buffer.subarray(RSA_ENCRYPTED_KEY_BYTES + GCM_IV_BYTES);

    // Extract ciphertext and auth tag (last 16 bytes)
    const tag = aesData.subarray(aesData.length - GCM_TAG_BYTES);
    const ciphertext = aesData.subarray(0, aesData.length - GCM_TAG_BYTES);

    // 1. RSA decrypt the AES key
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encryptedAesKey
    );

    // 2. AES-256-GCM decrypt + verify auth tag
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  /**
   * Compute SHA-256 hash of the base64 ciphertext.
   * Used as the idempotent claim key.
   * @param {string} base64Ciphertext
   * @returns {string} Hex-encoded SHA-256 hash
   */
  static hashCiphertext(base64Ciphertext) {
    return crypto.createHash('sha256').update(base64Ciphertext, 'utf8').digest('hex');
  }
}
