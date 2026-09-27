import assert from 'assert';
import { meshSimulator } from '../services/meshSimulator.js';
import { BridgeIngestionService } from '../services/bridgeIngestion.js';
import { db } from '../db/database.js';

console.log('Testing Idempotency and Concurrency Pipeline...');

// Reset state
meshSimulator.reset();

const initialAliceBalance = db.getAccount('alice@upi').balance;
const sendAmount = 500.0;

// Create 1 single packet from Alice to Bob
const packet = meshSimulator.createPacket('alice@upi', 'bob@upi', sendAmount, '1234', 5);

console.log('Simulating 3 concurrent bridge nodes delivering the same packet...');
// Deliver simultaneously from 3 bridges
const results = [
  BridgeIngestionService.ingest(packet, 'bridge-1', 2),
  BridgeIngestionService.ingest(packet, 'bridge-2', 3),
  BridgeIngestionService.ingest(packet, 'bridge-3', 1),
];

console.log('Outcomes:', results.map(r => r.outcome));

const settledCount = results.filter(r => r.outcome === 'SETTLED').length;
const duplicateCount = results.filter(r => r.outcome === 'DUPLICATE_DROPPED').length;

console.log(`Settled: ${settledCount}, Duplicate Dropped: ${duplicateCount}`);

assert.strictEqual(settledCount, 1, 'Exactly one packet should settle');
assert.strictEqual(duplicateCount, 2, 'Two packets should be dropped as duplicates');

const finalAliceBalance = db.getAccount('alice@upi').balance;
console.log(`Alice Balance: Before = ₹${initialAliceBalance}, After = ₹${finalAliceBalance}`);

assert.strictEqual(
  finalAliceBalance,
  initialAliceBalance - sendAmount,
  'Alice should be debited exactly once!'
);

console.log('Idempotency & Concurrency Test Passed Successfully! [OK]');
