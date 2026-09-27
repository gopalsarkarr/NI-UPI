import assert from 'assert';
import { HybridCryptoService } from '../crypto/hybridCrypto.js';

console.log('Testing HybridCryptoService...');

const sampleInstruction = {
  senderVpa: 'alice@upi',
  receiverVpa: 'bob@upi',
  amount: 500.0,
  pin: '1234',
  nonce: '550e8400-e29b-41d4-a716-446655440000',
  signedAt: Date.now(),
};

// 1. Encrypt
const ciphertext = HybridCryptoService.encrypt(sampleInstruction);
console.log('Encrypted Base64 ciphertext length:', ciphertext.length);
assert(ciphertext.length > 300, 'Ciphertext should be properly populated');

// 2. Hash
const hash = HybridCryptoService.hashCiphertext(ciphertext);
console.log('Ciphertext SHA-256 Hash:', hash);
assert.strictEqual(hash.length, 64, 'SHA-256 hex hash must be 64 characters');

// 3. Decrypt
const decrypted = HybridCryptoService.decrypt(ciphertext);
console.log('Decrypted successfully:', decrypted);
assert.strictEqual(decrypted.senderVpa, sampleInstruction.senderVpa);
assert.strictEqual(decrypted.receiverVpa, sampleInstruction.receiverVpa);
assert.strictEqual(decrypted.amount, sampleInstruction.amount);
assert.strictEqual(decrypted.nonce, sampleInstruction.nonce);

// 4. Test Tamper Resistance (GCM auth tag verification)
console.log('Testing tamper detection...');
const rawBuffer = Buffer.from(ciphertext, 'base64');
// Flip 1 bit in the ciphertext part
rawBuffer[rawBuffer.length - 20] ^= 0x01;
const tamperedCiphertext = rawBuffer.toString('base64');

let tamperCaught = false;
try {
  HybridCryptoService.decrypt(tamperedCiphertext);
} catch (err) {
  tamperCaught = true;
  console.log('Caught expected tampering error:', err.message);
}
assert(tamperCaught, 'Tampered ciphertext must be rejected!');

console.log('All Cryptography Tests Passed Successfully! [OK]');
