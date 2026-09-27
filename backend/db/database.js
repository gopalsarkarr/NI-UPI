/**
 * Database Layer for UPI Offline Mesh Backend.
 *
 * Supports Dual Mode:
 * 1. Persistent Cloud PostgreSQL (Supabase / Neon) when process.env.DATABASE_URL is provided.
 * 2. In-Memory ACID Transactional Store when offline or running locally without DATABASE_URL.
 */

import pg from 'pg';

class Database {
  constructor() {
    this.accounts = new Map();
    this.transactions = [];
    this.transactionIdCounter = 1;
    this.pgPool = null;

    // Initialize local seed
    this.seedLocal();

    // If DATABASE_URL is present, connect and sync with PostgreSQL
    if (process.env.DATABASE_URL) {
      this.initPostgres();
    }
  }

  seedLocal() {
    this.accounts.clear();
    this.transactions = [];
    this.transactionIdCounter = 1;

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

  async initPostgres() {
    try {
      this.pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      console.log('🐘 Connecting to Cloud PostgreSQL (Supabase/Neon)...');

      // 1. Create tables if not exist
      await this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          vpa VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100),
          balance NUMERIC(15, 2) DEFAULT 0.00,
          version INT DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          packet_hash VARCHAR(64) UNIQUE,
          sender_vpa VARCHAR(100),
          receiver_vpa VARCHAR(100),
          amount NUMERIC(15, 2),
          status VARCHAR(30),
          reason VARCHAR(100),
          bridge_node_id VARCHAR(50),
          hop_count INT,
          settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Populate default accounts if table is empty
      const accCountRes = await this.pgPool.query('SELECT COUNT(*) FROM accounts');
      if (parseInt(accCountRes.rows[0].count, 10) === 0) {
        for (const [vpa, acc] of this.accounts.entries()) {
          await this.pgPool.query(
            'INSERT INTO accounts (vpa, name, balance, version) VALUES ($1, $2, $3, $4) ON CONFLICT (vpa) DO NOTHING',
            [acc.vpa, acc.name, acc.balance, acc.version]
          );
        }
      }

      // 3. Load latest state from PostgreSQL into memory
      await this.syncFromPostgres();
      console.log('✅ PostgreSQL Connected & Synced successfully!');
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection failed (falling back to In-Memory mode):', err.message);
      this.pgPool = null;
    }
  }

  async syncFromPostgres() {
    if (!this.pgPool) return;
    try {
      const accRes = await this.pgPool.query('SELECT * FROM accounts');
      for (const row of accRes.rows) {
        this.accounts.set(row.vpa, {
          vpa: row.vpa,
          name: row.name,
          balance: parseFloat(row.balance),
          version: parseInt(row.version, 10),
        });
      }

      const txRes = await this.pgPool.query('SELECT * FROM transactions ORDER BY id ASC');
      this.transactions = txRes.rows.map(row => ({
        id: row.id,
        packetHash: row.packet_hash,
        senderVpa: row.sender_vpa,
        receiverVpa: row.receiver_vpa,
        amount: parseFloat(row.amount),
        status: row.status,
        reason: row.reason,
        bridgeNodeId: row.bridge_node_id,
        hopCount: row.hop_count,
        settledAt: row.settled_at ? new Date(row.settled_at).toISOString() : new Date().toISOString(),
      }));

      if (this.transactions.length > 0) {
        this.transactionIdCounter = Math.max(...this.transactions.map(t => t.id)) + 1;
      }
    } catch (err) {
      console.warn('Error syncing from PostgreSQL:', err.message);
    }
  }

  seed() {
    this.seedLocal();
    if (this.pgPool) {
      this.pgPool.query('DELETE FROM transactions').catch(() => {});
      this.pgPool.query('DELETE FROM accounts').then(async () => {
        for (const [vpa, acc] of this.accounts.entries()) {
          await this.pgPool.query(
            'INSERT INTO accounts (vpa, name, balance, version) VALUES ($1, $2, $3, $4)',
            [acc.vpa, acc.name, acc.balance, acc.version]
          );
        }
      }).catch(err => console.warn('Error resetting PostgreSQL accounts:', err.message));
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
   * Atomic settlement transaction:
   * 1. Check unique packet_hash
   * 2. Check sender balance >= amount
   * 3. Debit sender, credit receiver, increment version
   * 4. Record transaction in ledger (and persist to PostgreSQL if connected)
   */
  settle({ instruction, packetHash, bridgeNodeId, hopCount }) {
    const existingTx = this.transactions.find(t => t.packetHash === packetHash);
    if (existingTx) {
      throw new Error(`Unique constraint violation: Transaction with packetHash ${packetHash} already settled`);
    }

    let sender = this.accounts.get(instruction.senderVpa);
    if (!sender) {
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

      // Async write to PostgreSQL
      if (this.pgPool) {
        this.pgPool.query(
          `INSERT INTO transactions (packet_hash, sender_vpa, receiver_vpa, amount, status, reason, bridge_node_id, hop_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [packetHash, instruction.senderVpa, instruction.receiverVpa, amount, 'REJECTED', 'INSUFFICIENT_FUNDS', bridgeNodeId, hopCount]
        ).catch(err => console.warn('PostgreSQL write error:', err.message));
      }

      return rejectedTx;
    }

    // Debit & Credit in memory
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

    // Persist to PostgreSQL in background
    if (this.pgPool) {
      (async () => {
        try {
          await this.pgPool.query(
            'UPDATE accounts SET balance = $1, version = $2 WHERE vpa = $3',
            [sender.balance, sender.version, sender.vpa]
          );
          await this.pgPool.query(
            'UPDATE accounts SET balance = $1, version = $2 WHERE vpa = $3',
            [receiver.balance, receiver.version, receiver.vpa]
          );
          await this.pgPool.query(
            `INSERT INTO transactions (packet_hash, sender_vpa, receiver_vpa, amount, status, reason, bridge_node_id, hop_count)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [packetHash, instruction.senderVpa, instruction.receiverVpa, amount, 'SETTLED', null, bridgeNodeId, hopCount]
          );
        } catch (err) {
          console.warn('PostgreSQL settlement persistence error:', err.message);
        }
      })();
    }

    return settledTx;
  }
}

export const db = new Database();
