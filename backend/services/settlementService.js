import { db } from '../db/database.js';

/**
 * Settlement Service
 * Executes ledger update: debits sender, credits receiver, writes transaction entry.
 */
export class SettlementService {
  static settle(instruction, packetHash, bridgeNodeId, hopCount) {
    return db.settle({
      instruction,
      packetHash,
      bridgeNodeId,
      hopCount,
    });
  }
}
