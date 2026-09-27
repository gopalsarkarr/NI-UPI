import React from 'react';
import { History, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LedgerTable({ transactions = [], lastResult }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Settlement Ledger
        </h3>
        {lastResult && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-mono text-slate-300">
            Last Action: <strong className="text-blue-400">{lastResult}</strong>
          </span>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No settlements recorded yet. Inject a payment and click "Bridges Upload to Server".
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5 pl-1">Tx #</th>
                <th className="pb-2.5">Flow</th>
                <th className="pb-2.5">Amount</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Ciphertext Hash (Idempotency Key)</th>
                <th className="pb-2.5">Hops</th>
                <th className="pb-2.5 text-right">Time</th>
                <th className="pb-2.5 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pl-1 font-mono text-slate-400">#{tx.id}</td>
                  <td className="py-2.5">
                    <span className="flex items-center gap-1.5 font-mono text-slate-200">
                      <span>{tx.senderVpa}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>{tx.receiverVpa}</span>
                    </span>
                  </td>
                  <td className="py-2.5 font-mono font-bold text-slate-100">
                    ₹{Number(tx.amount).toFixed(2)}
                  </td>
                  <td className="py-2.5">
                    {tx.status === 'SETTLED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        SETTLED
                      </span>
                    )}
                    {tx.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3 h-3" />
                        {tx.reason || 'REJECTED'}
                      </span>
                    )}
                    {tx.status === 'DUPLICATE_DROPPED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        DUPLICATE DROPPED
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400" title={tx.packetHash}>
                    {tx.packetHash ? `${tx.packetHash.substring(0, 16)}...` : 'N/A'}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">
                    {tx.hopCount} hops ({tx.bridgeNodeId})
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-500">
                    {new Date(tx.settledAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 text-right pr-1">
                    <button
                      onClick={() => onOpenPaymentModal && onOpenPaymentModal(tx)}
                      className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-semibold transition-colors"
                      title="Open Live QR & Bank OTP"
                    >
                      QR / OTP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
