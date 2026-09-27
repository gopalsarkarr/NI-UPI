import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wifi, 
  Github, 
  Linkedin, 
  Mail, 
  Globe, 
  Heart, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Code2
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-rose-200/80 bg-rose-50/60 text-zinc-600 mt-12 shadow-[0_-2px_12px_rgba(225,29,72,0.03)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Project Identity & Vision */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/20">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm text-zinc-900 tracking-tight">
                Offline UPI Mesh
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Decentralized peer-to-peer payment protocol operating over Bluetooth Low Energy (BLE) gossip without internet connectivity.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-rose-800 bg-white border border-rose-200/80 rounded-md px-2 py-1 font-mono w-fit shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>RSA-2048 + AES-GCM-256</span>
            </div>
          </div>

          {/* Column 2: About the Creator / Developer Profile */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-rose-600" />
              About the Developer
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Engineered with a focus on high-reliability distributed systems, cryptographic security, and next-gen offline fintech protocols.
            </p>
            
            {/* Social / Developer Links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-zinc-700 border border-rose-200/80 flex items-center justify-center transition-all shadow-2xs"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-zinc-700 border border-rose-200/80 flex items-center justify-center transition-all shadow-2xs"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:developer@example.com"
                className="w-8 h-8 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-zinc-700 border border-rose-200/80 flex items-center justify-center transition-all shadow-2xs"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-zinc-700 border border-rose-200/80 flex items-center justify-center transition-all shadow-2xs"
                title="Personal Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="text-zinc-600 hover:text-rose-600 transition-colors flex items-center gap-1.5">
                  <span>Home (Payment Terminal)</span>
                </Link>
              </li>
              <li>
                <Link to="/balances" className="text-zinc-600 hover:text-rose-600 transition-colors flex items-center gap-1.5">
                  <span>Balances &amp; Settlement Ledger</span>
                </Link>
              </li>
              <li>
                <Link to="/crypto" className="text-zinc-600 hover:text-rose-600 transition-colors flex items-center gap-1.5">
                  <span>Crypto Keys &amp; Wire Format</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-600 hover:text-rose-600 transition-colors flex items-center gap-1.5">
                  <span>2D Network Architecture</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Architectural Specs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-rose-600" />
              System Architecture
            </h4>
            <ul className="space-y-1.5 text-[11px] text-zinc-600 font-mono">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Node.js / Java Spring Boot</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>SHA-256 Idempotency Cache</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>ACID Optimistic Locking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>React 18 + Tailwind CSS</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Live Node Status */}
        <div className="border-t border-rose-200/60 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-1">
            <span>Designed &amp; Developed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for resilient offline payments &bull; &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200/90 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Node Backend Active (Port 5000)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
