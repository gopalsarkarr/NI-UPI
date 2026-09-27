import express from 'express';
import { serverKeyHolder } from '../crypto/keyHolder.js';
import { db } from '../db/database.js';
import { idempotencyService } from '../services/idempotencyService.js';
import { meshSimulator } from '../services/meshSimulator.js';
import { BridgeIngestionService } from '../services/bridgeIngestion.js';

const router = express.Router();

// 1. Server Public Key
router.get('/server-key', (req, res) => {
  res.json({
    publicKey: serverKeyHolder.getPublicKeyBase64(),
    publicKeyPem: serverKeyHolder.getPublicKey(),
    algorithm: 'RSA-2048 / OAEP-SHA256',
    hybridScheme: 'RSA-OAEP encrypts an AES-256-GCM session key',
  });
});

// 2. Accounts
router.get('/accounts', (req, res) => {
  res.json(db.getAccounts());
});

// 3. Transactions Ledger
router.get('/transactions', (req, res) => {
  res.json(db.getTransactions(25));
});

// 4. Mesh State
router.get('/mesh/state', (req, res) => {
  const devices = meshSimulator.getDevices().map(d => ({
    deviceId: d.deviceId,
    hasInternet: d.hasInternet,
    isRealBle: Boolean(d.isRealBle),
    realName: d.realName || d.deviceId,
    packetCount: d.heldPackets.size,
    packetIds: Array.from(d.heldPackets.keys()).map(id => id.substring(0, 8)),
    packets: d.getPackets().map(p => ({
      packetId: p.packetId,
      ttl: p.ttl,
      createdAt: p.createdAt,
      ciphertextPreview: p.ciphertext.substring(0, 32) + '...',
    })),
  }));

  res.json({
    devices,
    idempotencyCacheSize: idempotencyService.size(),
  });
});

// 4b. Add Real / Custom Bluetooth Device
router.post('/mesh/add-device', (req, res) => {
  try {
    const { deviceId, realName, hasInternet = false } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }
    const device = meshSimulator.addCustomDevice(deviceId, hasInternet, true, realName);
    res.json({
      success: true,
      deviceId: device.deviceId,
      realName: device.realName,
      isRealBle: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Inject simulated payment into mesh
router.post('/demo/send', (req, res) => {
  try {
    const { senderVpa, receiverVpa, amount, pin, ttl, startDevice } = req.body;
    if (!senderVpa || !receiverVpa || !amount) {
      return res.status(400).json({ error: 'senderVpa, receiverVpa, and amount are required' });
    }

    const packet = meshSimulator.createPacket(
      senderVpa,
      receiverVpa,
      amount,
      pin || '1234',
      ttl || 5
    );

    const targetDevice = startDevice || 'phone-alice';
    meshSimulator.inject(targetDevice, packet);

    res.json({
      packetId: packet.packetId,
      ciphertextPreview: packet.ciphertext.substring(0, 64) + '...',
      ciphertextFull: packet.ciphertext,
      ttl: packet.ttl,
      injectedAt: targetDevice,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Mesh Gossip Round
router.post('/mesh/gossip', (req, res) => {
  const result = meshSimulator.gossipOnce();
  res.json(result);
});

// 7. Flush Bridges (Bridges upload to backend)
router.post('/mesh/flush', (req, res) => {
  const results = meshSimulator.flushBridges();
  res.json({
    uploadedCount: results.length,
    results,
  });
});

// 8. Reset Mesh & Database
router.post('/mesh/reset', (req, res) => {
  const result = meshSimulator.reset();
  res.json(result);
});

// 9. THE Core Production Ingestion Endpoint
router.post('/bridge/ingest', (req, res) => {
  const bridgeNodeId = req.header('X-Bridge-Node-Id') || req.body.bridgeNodeId || 'external-bridge';
  const hopCount = parseInt(req.header('X-Hop-Count') || req.body.hopCount || '1', 10);

  const packet = {
    packetId: req.body.packetId,
    ttl: req.body.ttl,
    createdAt: req.body.createdAt,
    ciphertext: req.body.ciphertext,
  };

  const result = BridgeIngestionService.ingest(packet, bridgeNodeId, hopCount);

  if (result.outcome === 'INVALID') {
    return res.status(400).json(result);
  }

  // Both SETTLED and DUPLICATE_DROPPED return 200 OK (Bridge node did its job)
  res.status(200).json(result);
});

// 10. Concurrency Demo: Simulate 3 Bridges simultaneously uploading the exact same packet
router.post('/demo/test-concurrency', async (req, res) => {
  try {
    const { senderVpa = 'alice@upi', receiverVpa = 'bob@upi', amount = 100 } = req.body;
    const packet = meshSimulator.createPacket(senderVpa, receiverVpa, amount, '1234', 5);

    // Fire 3 simultaneous ingestion attempts
    const promises = [
      Promise.resolve().then(() => BridgeIngestionService.ingest(packet, 'bridge-alpha', 3)),
      Promise.resolve().then(() => BridgeIngestionService.ingest(packet, 'bridge-beta', 4)),
      Promise.resolve().then(() => BridgeIngestionService.ingest(packet, 'bridge-gamma', 2)),
    ];

    const results = await Promise.all(promises);

    res.json({
      message: 'Simulated 3 concurrent bridge uploads for the exact same packet',
      packetId: packet.packetId,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
