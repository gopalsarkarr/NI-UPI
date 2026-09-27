import React, { useState } from 'react';
import { Send, Share2, UploadCloud, Zap, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function ActionControls({
  onInject,
  onGossip,
  onFlush,
  onTestConcurrency,
  loadingAction,
  accounts = [],
  devices = [],
}) {
  const [senderVpa, setSenderVpa] = useState('alice@upi');
  const [receiverVpa, setReceiverVpa] = useState('bob@upi');
  const [amount, setAmount] = useState('500');
  const [pin, setPin] = useState('1234');
  const [startDevice, setStartDevice] = useState('phone-alice');

  const handleInjectSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    onInject({
      senderVpa,
      receiverVpa,
      amount: Number(amount),
      pin,
      startDevice,
      ttl: 5,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* STEP 1: Compose & Inject */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Step 1 • Offline Sender
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              RSA-OAEP + AES-GCM
            </span>
          </div>
          <h3 className="font-semibold text-white text-sm mb-3">
            Compose Offline Payment Instruction
          </h3>

          <form onSubmit={handleInjectSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                  <span>Sender UPI ID</span>
                  <span className="text-[10px] text-blue-400 font-mono">Custom/Pre-set</span>
                </label>
                <input
                  type="text"
                  list="sender-presets"
                  value={senderVpa}
                  onChange={(e) => setSenderVpa(e.target.value)}
                  placeholder="e.g. yourname@upi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
                <datalist id="sender-presets">
                  {accounts.map((acc) => (
                    <option key={acc.vpa} value={acc.vpa}>
                      ₹{acc.balance}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                  <span>Receiver UPI ID</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Real/Custom</span>
                </label>
                <input
                  type="text"
                  list="receiver-presets"
                  value={receiverVpa}
                  onChange={(e) => setReceiverVpa(e.target.value)}
                  placeholder="e.g. friend@paytm"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
                <datalist id="receiver-presets">
                  <option value="bob@upi">Bob</option>
                  <option value="merchant@upi">Merchant Store</option>
                  <option value="friend@paytm">Friend Paytm</option>
                  <option value="shop@oksbi">Shopkeeper SBI</option>
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">UPI PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Initial Phone</label>
                <select
                  value={startDevice}
                  onChange={(e) => setStartDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  {devices.length > 0 ? (
                    devices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.realName || d.deviceId} {d.isRealBle ? '★ (Your Phone)' : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="phone-alice">phone-alice</option>
                      <option value="phone-bob">phone-bob</option>
                      <option value="phone-carol">phone-carol</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction === 'inject'}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loadingAction === 'inject' ? 'Encrypting & Injecting...' : 'Encrypt & Inject into Mesh'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* STEP 2: Gossip Round */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Step 2 • BLE Gossip
            </span>
          </div>
          <h3 className="font-semibold text-white text-sm mb-1.5">Propagate Packets</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every phone broadcasts held packets to nearby phones. TTL decrements per hop.
          </p>
        </div>

        <button
          onClick={onGossip}
          disabled={loadingAction === 'gossip'}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50"
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{loadingAction === 'gossip' ? 'Propagating...' : '🔄 Run Gossip Round'}</span>
        </button>
      </div>

      {/* STEP 3 & 4: Flush & Concurrency Test */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Step 3 • Bridge Upload
            </span>
          </div>
          <h3 className="font-semibold text-white text-sm mb-1.5">Settlement Ingestion</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bridges with 4G/WiFi POST packets to <code className="text-slate-300">/api/bridge/ingest</code>.
          </p>
        </div>

        <div className="space-y-2 mt-4">
          <button
            onClick={onFlush}
            disabled={loadingAction === 'flush'}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{loadingAction === 'flush' ? 'Ingesting...' : '📡 Bridges Upload to Server'}</span>
          </button>

          <button
            onClick={onTestConcurrency}
            disabled={loadingAction === 'concurrency'}
            className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold py-2 px-3 rounded-xl border border-amber-500/30 transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{loadingAction === 'concurrency' ? 'Testing...' : '⚡ Test 3-Bridge Duplicate Storm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
