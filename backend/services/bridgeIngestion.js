import { HybridCryptoService } from '../crypto/hybridCrypto.js';
import { idempotencyService } from './idempotencyService.js';
import { SettlementService } from './settlementService.js';

const MAX_AGE_SECONDS = 86400; // 24 hours

export class BridgeIngestionService {
  /**
   * Ingest a mesh packet arriving from a bridge node:
   * 1. Hash ciphertext (SHA-256)
   * 2. Idempotency claim (drop duplicate)
   * 3. Hybrid Decrypt (RSA-OAEP + AES-GCM; tampering causes exception)
   * 4. Freshness check (signedAt within 24h)
   * 5. Settle ledger (DB transaction)
   */
  static ingest(packet, bridgeNodeId = 'unknown-bridge', hopCount = 0) {
    if (!packet || !packet.ciphertext) {
      return {
        outcome: 'INVALID',
        packetHash: null,
        reason: 'missing_ciphertext',
        transactionId: null,
      };
    }

    try {
      const packetHash = HybridCryptoService.hashCiphertext(packet.ciphertext);

      // 1. Idempotency Gate
      if (!idempotencyService.claim(packetHash)) {
        return {
          outcome: 'DUPLICATE_DROPPED',
          packetHash,
          reason: 'duplicate_delivery',
          transactionId: null,
        };
      }

      // 2. Hybrid Decrypt
      let instruction;
      try {
        instruction = HybridCryptoService.decrypt(packet.ciphertext);
      } catch (err) {
        return {
          outcome: 'INVALID',
          packetHash,
          reason: `decryption_failed: ${err.message}`,
          transactionId: null,
        };
      }

      // 3. Freshness check (replay attack protection)
      const now = Date.now();
      const ageSeconds = (now - instruction.signedAt) / 1000;

      if (ageSeconds > MAX_AGE_SECONDS) {
        return {
          outcome: 'INVALID',
          packetHash,
          reason: 'stale_packet',
          transactionId: null,
        };
      }

      if (ageSeconds < -300) {
        return {
          outcome: 'INVALID',
          packetHash,
          reason: 'future_dated',
          transactionId: null,
        };
      }

      // 4. Settle Transaction
      const tx = SettlementService.settle(instruction, packetHash, bridgeNodeId, hopCount);

      return {
        outcome: tx.status === 'SETTLED' ? 'SETTLED' : 'REJECTED',
        packetHash,
        reason: tx.reason || null,
        transactionId: tx.id,
        transaction: tx,
      };
    } catch (err) {
      return {
        outcome: 'INVALID',
        packetHash: null,
        reason: `internal_error: ${err.message}`,
        transactionId: null,
      };
    }
  }
}
