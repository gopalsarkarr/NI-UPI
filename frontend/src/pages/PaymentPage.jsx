import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Send, Share2, UploadCloud, Zap, Lock, ShieldCheck, CheckCircle2, ArrowRight, XCircle, AlertCircle, Ban } from 'lucide-react';
import MeshVisualizer from '../components/MeshVisualizer';

export default function PaymentPage({
  meshState,
  accounts = [],
  onInject,
  onCancelPayment,
  onGossip,
  onFlush,
  onTestConcurrency,
  loadingAction,
  lastResult,
  lastPacket,
}) {
  const [senderVpa, setSenderVpa] = useState('alice@upi');
  const [receiverVpa, setReceiverVpa] = useState('bob@upi');
  const [amount, setAmount] = useState('500');
  const [pin, setPin] = useState('1234');
  const [startDevice, setStartDevice] = useState('phone-alice');

  const handlePaySubmit = (e) => {
    e.preventDefault();

    // 1. Amount validation
    if (!amount || Number(amount) <= 0) {
      toast.error('❌ Invalid Amount: Please enter a payment amount greater than ₹0.');
      return;
    }

    // 2. Sender vs Receiver validation
    if (senderVpa === receiverVpa) {
      toast.error('❌ Transfer Error: Sender and Receiver cannot be the same UPI ID.');
      return;
    }

    // 3. Sender balance check
    const senderAcc = accounts.find((a) => a.vpa === senderVpa);
    if (senderAcc && Number(amount) > Number(senderAcc.balance)) {
      toast.error(
        `❌ Insufficient Balance: ${senderVpa} only has ₹${Number(senderAcc.balance).toLocaleString('en-IN')}, cannot pay ₹${amount}`
      );
      return;
    }

    // 4. UPI PIN validation
    if (!pin || pin.length !== 4) {
      toast.error('❌ Invalid UPI PIN: 4-digit numeric PIN is required.');
      return;
    }

    onInject({
      senderVpa,
      receiverVpa,
      amount: Number(amount),
      pin,
      startDevice,
      ttl: 5,
    });
  };

  const handleCancelIntent = () => {
    setAmount('');
    setPin('');
    if (onCancelPayment) {
      onCancelPayment('Payment transaction was cancelled by user.');
    } else {
      toast.warn('⚠️ Payment Cancelled: Transaction was aborted.');
    }
  };

  const handleSimulatePinError = () => {
    toast.error('❌ Payment Error: Incorrect UPI PIN entered (Error Code: UPI-PIN-FAIL).');
  };

  const handleSimulateCancel = () => {
    toast.warn('⚠️ Payment Cancelled: User pressed back/cancelled on UPI PIN screen.', {
      icon: '🚫',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Telemetry notification banner if last action finished */}
      {lastResult && (
        <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{lastResult}</span>
          </div>
          <span className="font-mono text-zinc-500 text-[11px] shrink-0 ml-2">
            Idempotency: {meshState.idempotencyCacheSize} keys
          </span>
        </div>
      )}

      {/* 1. Payment Card (Top) — Authentic Fintech / Kotak / Apple Pay feel */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(225,29,72,0.04)] relative">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-rose-100/70 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-rose-500/20">
              UPI
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Offline Payment Intent</h2>
              <p className="text-[11px] text-zinc-500">Zero Internet Required &bull; RSA-2048 + AES-256-GCM</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/70">
            <Lock className="w-3 h-3 text-rose-600" />
            Hardware Encrypted
          </span>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handlePaySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender VPA */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                From (Sender Account)
              </label>
              <select
                value={senderVpa}
                onChange={(e) => setSenderVpa(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-mono focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors shadow-sm"
              >
                {accounts.map((acc) => (
                  <option key={acc.vpa} value={acc.vpa}>
                    {acc.vpa} (₹{Number(acc.balance).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Receiver VPA */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                To (Receiver Account)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={receiverVpa}
                  onChange={(e) => setReceiverVpa(e.target.value)}
                  placeholder="e.g. bob@upi"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-mono focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors pr-16 shadow-sm"
                />
                <span className="absolute right-2.5 top-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                  @upi
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 font-mono text-xs font-semibold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-7 pr-3 py-2 text-xs text-zinc-900 font-mono font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* UPI PIN (Masked dots) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                4-Digit UPI PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 font-mono tracking-widest text-center focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors shadow-sm"
              />
            </div>

            {/* Initial Device */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Offline Origin Phone
              </label>
              <select
                value={startDevice}
                onChange={(e) => setStartDevice(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-mono focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors shadow-sm"
              >
                <option value="phone-alice">phone-alice (Offline)</option>
                <option value="phone-bob">phone-bob (Offline)</option>
                <option value="phone-carol">phone-carol (Offline)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons: Step 1 Submit & Cancel */}
          <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
            <button
              type="submit"
              disabled={loadingAction === 'inject'}
              className="flex-1 py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-sm shadow-rose-600/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {loadingAction === 'inject' ? 'Generating Signed Packet...' : 'Step 1 • Encrypt & Inject into Mesh'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCancelIntent}
              className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 font-semibold text-xs transition-colors border border-zinc-200 flex items-center justify-center gap-1.5 active:scale-[0.99]"
              title="Cancel payment intent and reset fields"
            >
              <XCircle className="w-3.5 h-3.5 text-zinc-500" />
              <span>Cancel</span>
            </button>
          </div>

          {/* Toast Notification Simulation Shortcuts */}
          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span className="font-medium flex items-center gap-1 text-zinc-600">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              Test Toast Popups:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateCancel}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-medium transition-colors flex items-center gap-1"
              >
                <Ban className="w-3 h-3 text-amber-600" />
                <span>Simulate Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSimulatePinError}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 font-medium transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3 h-3 text-rose-600" />
                <span>Simulate Error</span>
              </button>
            </div>
          </div>
        </form>

        {/* Inline status ticket if packet created */}
        {lastPacket && (
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <div className="flex items-center justify-between text-zinc-800 mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Packet Encrypted &amp; Held at {lastPacket.injectedAt}
              </span>
              <span className="font-mono text-zinc-500 text-[11px]">TTL: {lastPacket.ttl} hops</span>
            </div>
            <p className="font-mono text-zinc-600 text-[11px] truncate">
              ID: {lastPacket.packetId} &bull; Ciphertext: {lastPacket.ciphertextPreview}
            </p>
          </div>
        )}
      </div>

      {/* 2. Sequential Stepper (Middle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Step 2: BLE Gossip */}
        <div className="bg-white border border-zinc-200/90 hover:border-rose-200 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold">
                Step 2 &bull; BLE Gossip
              </span>
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm mb-1">Propagate Hop-to-Hop</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every phone holding an encrypted packet broadcasts it to other phones nearby. TTL decrements per hop.
            </p>
          </div>

          <button
            onClick={onGossip}
            disabled={loadingAction === 'gossip'}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>{loadingAction === 'gossip' ? 'Broadcasting...' : '🔄 Run Gossip Round'}</span>
          </button>
        </div>

        {/* Step 3: Bridge Upload */}
        <div className="bg-white border border-zinc-200/90 hover:border-rose-200 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold">
                Step 3 &bull; Bridge Upload
              </span>
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm mb-1">Upload &amp; Settle Ledger</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Bridge phone walks outside into 4G coverage and POSTs held packets to <code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded font-mono">/api/bridge/ingest</code>.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={onFlush}
              disabled={loadingAction === 'flush'}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{loadingAction === 'flush' ? 'Ingesting...' : '📡 Bridges Upload to Server'}</span>
            </button>

            <button
              onClick={onTestConcurrency}
              disabled={loadingAction === 'concurrency'}
              className="w-full py-1.5 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-[11px] font-mono border border-zinc-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              title="Deliver 1 packet simultaneously via 3 bridges to test idempotency"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Test 3-Bridge Duplicate Storm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mesh Topology (Bottom of Home Page) */}
      <MeshVisualizer devices={meshState.devices} />
    </div>
  );
}
