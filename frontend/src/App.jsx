import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PaymentPage from './pages/PaymentPage';
import LedgerPage from './pages/LedgerPage';
import CryptoPage from './pages/CryptoPage';
import AboutPage from './pages/AboutPage';

// Read backend URL from environment or fallback to relative URL for local proxy
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function App() {
  const [meshState, setMeshState] = useState({ devices: [], idempotencyCacheSize: 0 });
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [serverKey, setServerKey] = useState(null);
  const [lastPacket, setLastPacket] = useState(null);
  const [lastResult, setLastResult] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Poll backend for state updates
  const refreshAll = async () => {
    try {
      const [keyRes, accRes, txRes, meshRes] = await Promise.all([
        fetch(`${API_BASE}/api/server-key`).then((r) => r.json()),
        fetch(`${API_BASE}/api/accounts`).then((r) => r.json()),
        fetch(`${API_BASE}/api/transactions`).then((r) => r.json()),
        fetch(`${API_BASE}/api/mesh/state`).then((r) => r.json()),
      ]);
      setServerKey(keyRes);
      setAccounts(accRes);
      setTransactions(txRes);
      setMeshState(meshRes);
    } catch (err) {
      console.warn('Backend polling:', err.message);
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 3000);
    return () => clearInterval(interval);
  }, []);

  // 1. Inject packet (offline sender)
  const handleInject = async (payload) => {
    setLoadingAction('inject');
    try {
      const res = await fetch(`${API_BASE}/api/demo/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(`❌ Payment Error: ${data.error || 'Failed to inject packet into mesh'}`);
        return;
      }
      setLastPacket(data);
      const msg = `Injected packet #${data.packetId.substring(0, 8)} into ${data.injectedAt}`;
      setLastResult(msg);
      toast.success(`🔐 Payment Encrypted & Injected! ₹${payload.amount} intent queued on ${data.injectedAt} (TTL: ${data.ttl} hops).`);
      await refreshAll();
    } catch (err) {
      console.error('Inject error:', err);
      toast.error(`❌ Network Error: Could not connect to mesh service (${err.message})`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Cancel Payment Handler
  const handleCancelPayment = (reason = 'Transaction aborted by user.') => {
    toast.warn(`⚠️ Payment Cancelled: ${reason}`, {
      icon: '🚫',
    });
  };

  // 2. Gossip round
  const handleGossip = async () => {
    setLoadingAction('gossip');
    try {
      const res = await fetch(`${API_BASE}/api/mesh/gossip`, { method: 'POST' });
      const data = await res.json();
      const msg = `Gossip round finished: ${data.transmissionsInRound} transmissions across ${data.activeDevices} devices`;
      setLastResult(msg);
      if (data.transmissionsInRound > 0) {
        toast.info(`🔄 BLE Gossip: ${data.transmissionsInRound} encrypted packet(s) hopped across ${data.activeDevices} mesh phones!`);
      } else {
        toast.info(`🔄 BLE Gossip round complete (no new packet hops required).`);
      }
      await refreshAll();
    } catch (err) {
      console.error('Gossip error:', err);
      toast.error(`❌ BLE Gossip Error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Flush bridges
  const handleFlush = async () => {
    setLoadingAction('flush');
    try {
      const res = await fetch(`${API_BASE}/api/mesh/flush`, { method: 'POST' });
      const data = await res.json();
      const settledCount = data.results.filter((r) => r.outcome === 'SETTLED').length;
      const rejectedCount = data.results.filter((r) => r.outcome === 'REJECTED' || r.outcome === 'INVALID').length;
      const dupCount = data.results.filter((r) => r.outcome === 'DUPLICATE_DROPPED').length;

      setLastResult(`Bridge upload: ${settledCount} settled, ${dupCount} duplicate dropped`);

      if (data.uploadedCount === 0) {
        toast.info('📡 Bridge has no pending packets. Run BLE Gossip to propagate packets to the bridge node first.');
      } else {
        if (settledCount > 0) {
          toast.success(`🎉 Payment Settled! ${settledCount} transaction(s) verified & credited to ledger!`);
        }
        if (rejectedCount > 0) {
          const rejectedItem = data.results.find((r) => r.outcome === 'REJECTED' || r.outcome === 'INVALID');
          toast.error(`❌ Payment Error: Settlement rejected (${rejectedItem?.reason || 'Validation failure'})`);
        }
        if (dupCount > 0) {
          toast.warn(`🛡️ Duplicate Storm Prevented: ${dupCount} duplicate bridge packet(s) dropped via SHA-256 idempotency.`);
        }
      }

      await refreshAll();
    } catch (err) {
      console.error('Flush error:', err);
      toast.error(`❌ Bridge Upload Error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Test Concurrency
  const handleTestConcurrency = async () => {
    setLoadingAction('concurrency');
    try {
      const res = await fetch(`${API_BASE}/api/demo/test-concurrency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderVpa: 'alice@upi', receiverVpa: 'bob@upi', amount: 200 }),
      });
      const data = await res.json();
      const settled = data.results.filter((r) => r.outcome === 'SETTLED').length;
      const dups = data.results.filter((r) => r.outcome === 'DUPLICATE_DROPPED').length;
      setLastResult(
        `Concurrency Test: 1 Packet sent to 3 bridges simultaneously -> ${settled} Settled, ${dups} Duplicates Dropped!`
      );
      toast.success(`🎉 Concurrency Test: ${settled} primary bridge packet SETTLED!`);
      toast.warn(`🛡️ Duplicate Storm Prevented: ${dups} concurrent duplicate packets DROPPED via atomic idempotency!`);
      await refreshAll();
    } catch (err) {
      console.error('Concurrency test error:', err);
      toast.error(`❌ Concurrency Test Error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // 5. Reset
  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch(`${API_BASE}/api/mesh/reset`, { method: 'POST' });
      setLastPacket(null);
      setLastResult('Mesh network, cache, and balances reset to default');
      toast.info('🔄 Demo Reset: Mesh packet queues, idempotency cache, and balances restored to initial state.');
      await refreshAll();
    } catch (err) {
      console.error('Reset error:', err);
      toast.error(`❌ Reset Error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB] text-zinc-900 flex flex-col font-sans">
      {/* Toast Notifications Pop-up Container */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Navigation Header */}
      <Navbar onReset={handleReset} isResetting={isResetting} />

      {/* Main Routed Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Routes>
          <Route
            path="/"
            element={
              <PaymentPage
                meshState={meshState}
                accounts={accounts}
                onInject={handleInject}
                onCancelPayment={handleCancelPayment}
                onGossip={handleGossip}
                onFlush={handleFlush}
                onTestConcurrency={handleTestConcurrency}
                loadingAction={loadingAction}
                lastResult={lastResult}
                lastPacket={lastPacket}
              />
            }
          />
          <Route
            path="/balances"
            element={<LedgerPage accounts={accounts} transactions={transactions} />}
          />
          <Route
            path="/crypto"
            element={<CryptoPage serverKey={serverKey} lastPacket={lastPacket} />}
          />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      {/* Comprehensive Professional Footer */}
      <Footer />
    </div>
  );
}
