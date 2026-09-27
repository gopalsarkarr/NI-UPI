import React from 'react';
import { Wallet, History, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LedgerPage({ accounts = [], transactions = [] }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-600" />
            Account Balances &amp; Settlement Ledger
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Cryptographic ledger state updated via offline mesh bridge ingestion
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 font-mono flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            ACID Ledger &bull; Optimistic Locking
          </span>
        </div>
      </div>

      {/* Top Section: Minimalist Account Cards */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-5 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
            Registered Accounts
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {accounts.length} Accounts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {accounts.map((acc) => (
            <div
              key={acc.vpa}
              className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-1"
            >
              <div className="text-[11px] text-zinc-500 truncate">{acc.name}</div>
              <div className="text-xs font-mono font-medium text-zinc-900 truncate">{acc.vpa}</div>
              <div className="text-base font-mono font-bold text-emerald-700 pt-1">
                ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono pt-1.5 border-t border-zinc-200 flex justify-between">
                <span>Version:</span>
                <span className="font-semibold text-zinc-600">v{acc.version}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Settlement Ledger Financial Table */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-5 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-rose-600" />
            Settled Transactions
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {transactions.length} Records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No transactions settled yet. Inject a payment on the Home page, run gossip, and click "Bridges Upload to Server".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-semibold text-[11px]">
                  <th className="pb-2.5 pl-1">Tx Ref</th>
                  <th className="pb-2.5">Transfer Flow</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Ciphertext Hash (Idempotency Key)</th>
                  <th className="pb-2.5">Hops</th>
                  <th className="pb-2.5 text-right pr-1">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-2.5 pl-1 font-mono text-zinc-500 font-medium">#{tx.id}</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1.5 font-mono text-zinc-800 font-medium">
                        <span>{tx.senderVpa}</span>
                        <ArrowRight className="w-3 h-3 text-rose-500" />
                        <span>{tx.receiverVpa}</span>
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-semibold text-zinc-900">
                      ₹{Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="py-2.5">
                      {tx.status === 'SETTLED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          SETTLED
                        </span>
                      )}
                      {tx.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-2.5 h-2.5" />
                          {tx.reason || 'REJECTED'}
                        </span>
                      )}
                      {tx.status === 'DUPLICATE_DROPPED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          DUPLICATE DROPPED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 font-mono text-zinc-500 text-[11px]" title={tx.packetHash}>
                      {tx.packetHash ? `${tx.packetHash.substring(0, 16)}...` : 'N/A'}
                    </td>
                    <td className="py-2.5 font-mono text-zinc-500 text-[11px]">
                      {tx.hopCount} hops ({tx.bridgeNodeId})
                    </td>
                    <td className="py-2.5 text-right pr-1 font-mono text-zinc-400 text-[11px]">
                      {new Date(tx.settledAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
