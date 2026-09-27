import { v4 as uuidv4 } from 'uuid';
import { HybridCryptoService } from '../crypto/hybridCrypto.js';
import { BridgeIngestionService } from './bridgeIngestion.js';
import { idempotencyService } from './idempotencyService.js';
import { db } from '../db/database.js';

class VirtualDevice {
  constructor(deviceId, hasInternet, isRealBle = false, realName = '') {
    this.deviceId = deviceId;
    this.hasInternet = hasInternet;
    this.isRealBle = isRealBle;
    this.realName = realName;
    this.heldPackets = new Map(); // packetId -> packet
  }

  addPacket(packet) {
    if (!this.heldPackets.has(packet.packetId)) {
      this.heldPackets.set(packet.packetId, { ...packet });
      return true;
    }
    return false;
  }

  removePacket(packetId) {
    this.heldPackets.delete(packetId);
  }

  getPackets() {
    return Array.from(this.heldPackets.values());
  }

  clear() {
    this.heldPackets.clear();
  }
}

class MeshSimulatorService {
  constructor() {
    this.devices = new Map();
    this.seedDevices();
  }

  seedDevices() {
    this.devices.clear();
    const seeds = [
      { id: 'phone-alice', internet: false },
      { id: 'phone-bob', internet: false },
      { id: 'phone-carol', internet: false },
      { id: 'phone-dave', internet: false },
      { id: 'phone-bridge', internet: true },
    ];

    for (const d of seeds) {
      this.devices.set(d.id, new VirtualDevice(d.id, d.internet));
    }
  }

  getDevices() {
    return Array.from(this.devices.values());
  }

  getDevice(id) {
    return this.devices.get(id);
  }

  addCustomDevice(deviceId, hasInternet = false, isRealBle = true, realName = '') {
    const cleanId = deviceId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const device = new VirtualDevice(cleanId, hasInternet, isRealBle, realName || deviceId);
    this.devices.set(cleanId, device);
    return device;
  }

  /**
   * Helper to create a signed payment instruction, encrypt it, and wrap in a MeshPacket.
   */
  createPacket(senderVpa, receiverVpa, amount, pin, ttl = 5) {
    const instruction = {
      senderVpa,
      receiverVpa,
      amount: Number(amount),
      pin,
      nonce: uuidv4(),
      signedAt: Date.now(),
    };

    const ciphertext = HybridCryptoService.encrypt(instruction);

    return {
      packetId: uuidv4(),
      ttl,
      createdAt: instruction.signedAt,
      ciphertext,
    };
  }

  /**
   * Inject a packet into a specific starting device (e.g. phone-alice).
   */
  inject(deviceId, packet) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    device.addPacket(packet);
    return packet;
  }

  /**
   * Run one round of gossip across all devices.
   * Every device holding packets broadcasts to every other device in mesh range.
   * TTL is decremented. If TTL reaches 0, it is not forwarded.
   */
  gossipOnce() {
    let packetsTransmitted = 0;
    const deviceList = Array.from(this.devices.values());

    // Gather all packets to broadcast
    const broadcastQueue = [];
    for (const sender of deviceList) {
      for (const packet of sender.getPackets()) {
        if (packet.ttl > 0) {
          broadcastQueue.push({
            senderId: sender.deviceId,
            packet: { ...packet, ttl: packet.ttl - 1 },
          });
        }
      }
    }

    // Deliver to other devices
    for (const item of broadcastQueue) {
      for (const receiver of deviceList) {
        if (receiver.deviceId !== item.senderId) {
          const added = receiver.addPacket(item.packet);
          if (added) {
            packetsTransmitted++;
          }
        }
      }
    }

    return {
      roundCompleted: true,
      transmissionsInRound: packetsTransmitted,
      activeDevices: deviceList.length,
    };
  }

  /**
   * All bridge devices that have internet upload held packets to the ingestion pipeline.
   */
  flushBridges() {
    const bridgeDevices = Array.from(this.devices.values()).filter(d => d.hasInternet);
    const results = [];

    for (const bridge of bridgeDevices) {
      const packets = bridge.getPackets();
      for (const packet of packets) {
        const result = BridgeIngestionService.ingest(packet, bridge.deviceId, 5 - packet.ttl);
        results.push({
          bridgeNodeId: bridge.deviceId,
          packetId: packet.packetId,
          ...result,
        });
        bridge.removePacket(packet.packetId);
      }
    }

    return results;
  }

  reset() {
    this.seedDevices();
    idempotencyService.clear();
    db.seed();
    return { status: 'RESET_COMPLETE' };
  }
}

export const meshSimulator = new MeshSimulatorService();
