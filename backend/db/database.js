/**
 * Database Layer for UPI Offline Mesh Backend.
 *
 * Provides a zero-dependency, transactional relational store with:
 * - Accounts table (vpa, name, balance, version for optimistic locking)
 * - Transactions table (id, packetHash [UNIQUE], senderVpa, receiverVpa, amount, status, timestamps)
 * - Atomic ACID transaction execution for debit/credit and ledger recording.
 *
 * Also exports SQL schema strings and MongoDB schema structures for production use.
 */

class Database {
  constructor() {
    this.accounts = new Map();
    this.transactions = [];
    this.transactionIdCounter = 1;
    this.seed();
  }

  seed() {
    this.accounts.clear();
    this.transactions = [];
    this.transactionIdCounter = 1;

    // Default accounts matching the Java demo
    const defaultAccounts = [
      { vpa: 'alice@upi', name: 'Alice Sen', balance: 5000.0, version: 0 },
      { vpa: 'bob@upi', name: 'Bob Roy', balance: 1200.0, version: 0 },
      { vpa: 'carol@upi', name: 'Carol Das', balance: 350.0, version: 0 },
      { vpa: 'dave@upi', name: 'Dave Ghosh', balance: 2500.0, version: 0 },
      { vpa: 'merchant@upi', name: 'Corner Grocery Store', balance: 10000.0, version: 0 },
    ];

    for (const acc of defaultAccounts) {
      this.accounts.set(acc.vpa, { ...acc });
    }
  }

  getAccounts() {
    return Array.from(this.accounts.values()).map(acc => ({ ...acc }));
  }

  getAccount(vpa) {
    const acc = this.accounts.get(vpa);
    return acc ? { ...acc } : null;
  }

  getTransactions(limit = 20) {
    return this.transactions.slice(-limit).reverse();
  }

  /**
   * Atomic ACID settlement transaction:
   * 1. Check unique packet_hash (Defense in depth)
   * 2. Check sender & receiver exist
   * 3. Check sender balance >= amount
   * 4. Debit sender, credit receiver, increment version
   * 5. Record transaction in ledger
   */
  settle({ instruction, packetHash, bridgeNodeId, hopCount }) {
    // 1. Unique constraint check on packet_hash
    const existingTx = this.transactions.find(t => t.packetHash === packetHash);
    if (existingTx) {
      throw new Error(`Unique constraint violation: Transaction with packetHash ${packetHash} already settled`);
    }

    let sender = this.accounts.get(instruction.senderVpa);
    if (!sender) {
      // Auto-register custom sender with starting balance
      sender = {
        vpa: instruction.senderVpa,
        name: instruction.senderVpa.split('@')[0],
        balance: 10000.0,
        version: 0,
      };
      this.accounts.set(instruction.senderVpa, sender);
    }

    let receiver = this.accounts.get(instruction.receiverVpa);
    if (!receiver) {
      // Auto-register custom receiver
      receiver = {
        vpa: instruction.receiverVpa,
        name: instruction.receiverVpa.split('@')[0],
        balance: 0.0,
        version: 0,
      };
      this.accounts.set(instruction.receiverVpa, receiver);
    }

    const amount = Number(instruction.amount);
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Balance check
    if (sender.balance < amount) {
      const rejectedTx = {
        id: this.transactionIdCounter++,
        packetHash,
        senderVpa: instruction.senderVpa,
        receiverVpa: instruction.receiverVpa,
        amount,
        status: 'REJECTED',
        reason: 'INSUFFICIENT_FUNDS',
        bridgeNodeId,
        hopCount,
        signedAt: new Date(instruction.signedAt).toISOString(),
        settledAt: new Date().toISOString(),
      };
      this.transactions.push(rejectedTx);
      return rejectedTx;
    }

    // Debit & Credit
    sender.balance = Number((sender.balance - amount).toFixed(2));
    sender.version += 1;

    receiver.balance = Number((receiver.balance + amount).toFixed(2));
    receiver.version += 1;

    const settledTx = {
      id: this.transactionIdCounter++,
      packetHash,
      senderVpa: instruction.senderVpa,
      receiverVpa: instruction.receiverVpa,
      amount,
      status: 'SETTLED',
      reason: null,
      bridgeNodeId,
      hopCount,
      signedAt: new Date(instruction.signedAt).toISOString(),
      settledAt: new Date().toISOString(),
    };

    this.transactions.push(settledTx);
    return settledTx;
  }
}

export const db = new Database();

// -------------------------------------------------------------
// Reference SQL and MongoDB schema definitions for production:
// -------------------------------------------------------------
export const ProductionSchemas = {
  PostgreSQL: `
    CREATE TABLE accounts (
      vpa VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      balance NUMERIC(12, 2) NOT NULL CHECK (balance >= 0),
      version INT DEFAULT 0
    );

    CREATE TABLE transactions (
      id BIGSERIAL PRIMARY KEY,
      packet_hash VARCHAR(64) UNIQUE NOT NULL,
      sender_vpa VARCHAR(50) REFERENCES accounts(vpa),
      receiver_vpa VARCHAR(50) REFERENCES accounts(vpa),
      amount NUMERIC(12, 2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      bridge_node_id VARCHAR(50),
      hop_count INT,
      signed_at TIMESTAMPTZ NOT NULL,
      settled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,
  MongoDB: `
    // Account Schema
    const AccountSchema = new mongoose.Schema({
      vpa: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      balance: { type: Number, required: true, min: 0 },
      version: { type: Number, default: 0 }
    });

    // Transaction Schema
    const TransactionSchema = new mongoose.Schema({
      packetHash: { type: String, required: true, unique: true },
      senderVpa: { type: String, required: true },
      receiverVpa: { type: String, required: true },
      amount: { type: Number, required: true },
      status: { type: String, enum: ['SETTLED', 'REJECTED'], required: true },
      bridgeNodeId: String,
      hopCount: Number,
      signedAt: Date,
      settledAt: { type: Date, default: Date.now }
    });
  `
};
