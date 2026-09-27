import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wifi, Send, Wallet, KeyRound, Info, RefreshCw } from 'lucide-react';

export default function Navbar({ onReset, isResetting }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200/80 font-semibold'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-rose-50/40'
    }`;

  return (
    <header className="border-b border-rose-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_3px_rgba(225,29,72,0.04)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/20">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-zinc-900 tracking-tight">Offline UPI</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-700 border border-rose-200 bg-rose-50 px-1.5 py-0.5 rounded">
              Mesh Protocol
            </span>
          </div>
        </div>

        {/* 4 Tabs in Exact Order: Home -> Balances -> Crypto Keys -> About */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/80">
          <NavLink to="/" className={linkClass} end>
            <Send className="w-3.5 h-3.5" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/balances" className={linkClass}>
            <Wallet className="w-3.5 h-3.5" />
            <span>Balances</span>
          </NavLink>

          <NavLink to="/crypto" className={linkClass}>
            <KeyRound className="w-3.5 h-3.5" />
            <span>Crypto Keys</span>
          </NavLink>

          <NavLink to="/about" className={linkClass}>
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </NavLink>
        </nav>

        {/* Reset Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium border border-zinc-200 hover:border-zinc-300 transition-colors disabled:opacity-50 shadow-sm"
            title="Reset mesh state and balances to default"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-rose-100 px-3 py-2 bg-white text-xs">
        <NavLink to="/" className={linkClass} end>
          <Send className="w-3.5 h-3.5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/balances" className={linkClass}>
          <Wallet className="w-3.5 h-3.5" />
          <span>Balances</span>
        </NavLink>
        <NavLink to="/crypto" className={linkClass}>
          <KeyRound className="w-3.5 h-3.5" />
          <span>Crypto</span>
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          <Info className="w-3.5 h-3.5" />
          <span>About</span>
        </NavLink>
      </div>
    </header>
  );
}
