# Offline UPI Mesh — Node.js & React Implementation

A complete Node.js (Express) + React (Tailwind CSS) implementation of the **Offline UPI Mesh Payment System with Deferred Settlement**.

This implementation lives side-by-side with the original Java/Spring Boot project without touching any of the original Java files.

---

## Architecture & Features

```
+-------------------------------------------------------------+
|               REACT DASHBOARD (Port 5173)                   |
|  - Real-time Bluetooth Mesh Visualizer                      |
|  - Interactive Controls (Inject, Gossip, Flush, Concurrency)|
|  - Live Balance Table & Settlement Ledger                   |
|  - Cryptographic Inspector (RSA-2048 + AES-GCM Wire Format) |
+──────────────────────────────┬──────────────────────────────+
                               │ HTTP / JSON
                               ▼
+-------------------------------------------------------------+
|               NODE.JS BACKEND (Port 5000)                   |
|  /api/bridge/ingest:                                        |
|   1. Hash Ciphertext -> SHA-256                             |
|   2. Idempotency Gate -> In-Memory Map / Redis SETNX claim  |
|   3. Hybrid Decrypt  -> Node.js built-in 'crypto'           |
|      (RSA-OAEP unwraps AES key, AES-GCM verifies auth tag)  |
|   4. Freshness Check -> Replay attack protection (< 24 hrs) |
|   5. Settlement Ledger -> ACID Transaction Debit & Credit   |
+─────────────────────────────────────────────────────────────+
```

---

## Quick Start Guide

### 1. Start the Node.js Backend

Open a terminal in `node-react-version/backend`:

```bash
cd node-react-version/backend
npm start
```
The backend starts on **http://localhost:5000**.

### 2. Start the React Frontend

Open a second terminal in `node-react-version/frontend`:

```bash
cd node-react-version/frontend
npm run dev
```
Open your browser at **http://localhost:5173**.

### 3. Run Automated Tests

To test hybrid cryptography and concurrency/idempotency:

```bash
cd node-react-version/backend
npm test
```

Test Results include:
- `testCrypto.js`: Tests RSA-OAEP + AES-256-GCM encryption/decryption roundtrip and verifies that tampering with a single bit in the ciphertext causes immediate rejection by the GCM authentication tag.
- `testConcurrency.js`: Simulates 3 bridge nodes simultaneously uploading the same packet to `/api/bridge/ingest`, asserting that exactly 1 settles and 2 are dropped as duplicates.

---

## Database Configuration

By default, an **in-memory transactional SQL store** is used so the demo works instantly with zero setup.

- **PostgreSQL / MySQL Schema**: See `backend/db/database.js` for SQL table definitions.
- **MongoDB Schema**: See `backend/db/database.js` for Mongoose schema structures.

---

## Running the Original Java Version

The Java version is completely untouched and available in the root folder:

```bash
.\mvnw.cmd spring-boot:run
```
Java dashboard is available at **http://localhost:8080**.
