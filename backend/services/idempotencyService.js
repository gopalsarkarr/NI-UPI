/**
 * Idempotency Service
 *
 * Implements atomic compare-and-set claim on the ciphertext hash.
 * Acts like Redis 'SET packet_hash timestamp NX EX 86400'.
 *
 * Any concurrent or subsequent delivery of the same packet is rejected immediately
 * BEFORE running expensive RSA/AES decryption or database transactions.
 */
class IdempotencyService {
  constructor() {
    this.seen = new Map(); // packetHash -> timestamp
    this.ttlMs = 24 * 60 * 60 * 1000; // 24 hours

    // Periodic cleanup of expired entries (unref so tests/scripts exit cleanly)
    const timer = setInterval(() => this.cleanup(), 60 * 1000);
    if (timer.unref) timer.unref();
  }

  /**
   * Try to atomically claim this packet hash.
   * @param {string} packetHash
   * @returns {boolean} true if first claimer, false if duplicate
   */
  claim(packetHash) {
    const now = Date.now();
    const existing = this.seen.get(packetHash);

    if (existing && (now - existing) < this.ttlMs) {
      return false; // Already claimed: DUPLICATE
    }

    this.seen.set(packetHash, now);
    return true; // First claimer
  }

  isClaimed(packetHash) {
    const now = Date.now();
    const existing = this.seen.get(packetHash);
    return Boolean(existing && (now - existing) < this.ttlMs);
  }

  size() {
    return this.seen.size;
  }

  clear() {
    this.seen.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [hash, time] of this.seen.entries()) {
      if (now - time > this.ttlMs) {
        this.seen.delete(hash);
      }
    }
  }
}

export const idempotencyService = new IdempotencyService();
