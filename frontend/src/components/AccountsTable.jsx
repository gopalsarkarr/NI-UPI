import React from 'react';
import { Wallet, Shield } from 'lucide-react';

export default function AccountsTable({ accounts = [] }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          Live Account Balances
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          ACID Ledger • Versioned Locks
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="pb-2.5 pl-1">VPA / User</th>
              <th className="pb-2.5">Name</th>
              <th className="pb-2.5 text-right">Balance</th>
              <th className="pb-2.5 text-right pr-1">Version</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {accounts.map((acc) => (
              <tr key={acc.vpa} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 pl-1 font-mono text-slate-200">{acc.vpa}</td>
                <td className="py-2.5 text-slate-400">{acc.name}</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                  ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 text-right pr-1 font-mono text-slate-500">
                  v{acc.version}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
