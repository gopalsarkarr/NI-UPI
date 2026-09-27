import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Healthcheck & metadata
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'UPI Without Internet - Mesh Network Backend',
    version: '1.0.0 (Node.js + Express)',
    crypto: 'RSA-2048 / OAEP-SHA256 + AES-256-GCM',
    endpoints: {
      serverKey: '/api/server-key',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      meshState: '/api/mesh/state',
      injectPacket: '/api/demo/send',
      gossip: '/api/mesh/gossip',
      flush: '/api/mesh/flush',
      reset: '/api/mesh/reset',
      ingest: '/api/bridge/ingest',
    },
  });
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Offline UPI Mesh Backend running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔐 Cryptography: Hybrid RSA-2048 + AES-256-GCM initialized`);
  console.log(`💾 Ledger: In-memory SQL transactional store ready`);
  console.log(`=======================================================`);
});
