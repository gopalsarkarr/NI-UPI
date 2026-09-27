import React from 'react';
import { ShieldCheck, Cpu, Terminal, ArrowRight, Share2, Layers, AlertCircle, Lock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-rose-100 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          About the Project &amp; 2D Architecture
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Technical specifications, 2D mesh topology diagram, and distributed systems problem solutions
        </p>
      </div>

      {/* 1. 2D Network Architecture Diagram (Custom Interactive SVG) */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-6 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-rose-600" />
            2D System Architecture Diagram
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">
            Physical Topology Flow
          </span>
        </div>

        {/* 2D SVG Canvas in Light Red & White Theme */}
        <div className="w-full bg-[#FAF9F9] border border-zinc-200/90 rounded-xl p-4 overflow-x-auto shadow-inner">
          <svg
            viewBox="0 0 900 280"
            className="w-full min-w-[700px] h-auto font-sans select-none"
          >
            {/* Zone A: Basement (Offline) - Soft Rose Tinted Zone */}
            <rect x="20" y="20" width="220" height="240" rx="12" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="1.5" />
            <text x="35" y="45" fill="#9F1239" fontSize="11" fontWeight="bold" letterSpacing="0.5">
              ZONE A &bull; BASEMENT (OFFLINE)
            </text>
            <text x="35" y="62" fill="#BE123C" fontSize="10">Zero Cellular &bull; Zero Wi-Fi</text>

            {/* Sender Device in Zone A */}
            <rect x="35" y="90" width="190" height="150" rx="8" fill="#FFFFFF" stroke="#FDA4AF" strokeWidth="1.5" />
            <circle cx="55" cy="115" r="10" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1.5" />
            <text x="75" y="119" fill="#881337" fontSize="11" fontWeight="700">Sender Phone (Alice)</text>
            <text x="50" y="145" fill="#4B5563" fontSize="10">1. Generates Nonce + Time</text>
            <text x="50" y="165" fill="#4B5563" fontSize="10">2. AES-256-GCM Encrypt</text>
            <text x="50" y="185" fill="#4B5563" fontSize="10">3. RSA-2048 Key Wrap</text>
            <text x="50" y="215" fill="#E11D48" fontSize="10" fontWeight="bold">Broadcasts BLE Beacon &rarr;</text>

            {/* Zone B: Mesh Hops (Untrusted Strangers) */}
            <rect x="270" y="20" width="200" height="240" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="285" y="45" fill="#334155" fontSize="11" fontWeight="bold" letterSpacing="0.5">
              ZONE B &bull; MESH HOPS
            </text>
            <text x="285" y="62" fill="#64748B" fontSize="10">Untrusted Devices (Strangers)</text>

            {/* Stranger Nodes */}
            <rect x="285" y="90" width="170" height="65" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="295" y="112" fill="#0F172A" fontSize="10" fontWeight="700">Stranger 1 (phone-bob)</text>
            <text x="295" y="132" fill="#64748B" fontSize="9">Holds ciphertext &bull; Decrements TTL</text>

            <rect x="285" y="170" width="170" height="65" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="295" y="192" fill="#0F172A" fontSize="10" fontWeight="700">Stranger 2 (phone-carol)</text>
            <text x="295" y="212" fill="#64748B" fontSize="9">Forwards packet over BLE</text>

            {/* Zone C: Street / 4G (Bridge Device) */}
            <rect x="500" y="20" width="180" height="240" rx="12" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
            <text x="515" y="45" fill="#065F46" fontSize="11" fontWeight="bold" letterSpacing="0.5">
              ZONE C &bull; STREET / 4G
            </text>
            <text x="515" y="62" fill="#047857" fontSize="10">Active Internet Link</text>

            {/* Bridge Node */}
            <rect x="515" y="90" width="150" height="150" rx="8" fill="#FFFFFF" stroke="#6EE7B7" strokeWidth="1.5" />
            <circle cx="535" cy="115" r="10" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
            <text x="555" y="119" fill="#064E3B" fontSize="11" fontWeight="700">Bridge Phone</text>
            <text x="530" y="145" fill="#4B5563" fontSize="10">&bull; Walks outside</text>
            <text x="530" y="165" fill="#4B5563" fontSize="10">&bull; Obtains 4G signal</text>
            <text x="530" y="195" fill="#059669" fontSize="10" fontWeight="bold">POST /api/bridge/ingest</text>
            <text x="530" y="215" fill="#6B7280" fontSize="9">Carries opaque payload &rarr;</text>

            {/* Zone D: Central Settlement Switch */}
            <rect x="710" y="20" width="170" height="240" rx="12" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1.5" />
            <text x="725" y="45" fill="#9A3412" fontSize="11" fontWeight="bold" letterSpacing="0.5">
              ZONE D &bull; SERVER
            </text>
            <text x="725" y="62" fill="#C2410C" fontSize="10">Central Banking Ledger</text>

            {/* Central Server Box */}
            <rect x="725" y="90" width="140" height="150" rx="8" fill="#FFFFFF" stroke="#FDBA74" strokeWidth="1.5" />
            <text x="735" y="115" fill="#7C2D12" fontSize="11" fontWeight="700">Settlement Engine</text>
            <text x="735" y="138" fill="#4B5563" fontSize="9">1. SHA-256 Hash</text>
            <text x="735" y="156" fill="#4B5563" fontSize="9">2. Idempotency Claim</text>
            <text x="735" y="174" fill="#4B5563" fontSize="9">3. RSA + GCM Decrypt</text>
            <text x="735" y="192" fill="#4B5563" fontSize="9">4. Freshness &lt; 24h</text>
            <text x="735" y="215" fill="#059669" fontSize="9" fontWeight="bold">&check; Settle Tx Ledger</text>

            {/* Connecting Arrows */}
            {/* Arrow Zone A to Zone B */}
            <path d="M 225 155 L 280 120" stroke="#E11D48" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 225 165 L 280 195" stroke="#E11D48" strokeWidth="2" strokeDasharray="3 3" />

            {/* Arrow Zone B to Zone C */}
            <path d="M 455 120 L 515 150" stroke="#64748B" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 455 195 L 515 160" stroke="#64748B" strokeWidth="2" strokeDasharray="3 3" />

            {/* Arrow Zone C to Zone D */}
            <path d="M 665 160 L 725 160" stroke="#059669" strokeWidth="2.5" />
            <polygon points="720,156 726,160 720,164" fill="#059669" />
          </svg>
        </div>
      </div>

      {/* 2. The 3 Hard Engineering Problems Solved */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-6 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          The Three Hard Engineering Problems &amp; Solutions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Problem 1 */}
          <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-2">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>1. Untrusted Intermediaries</span>
            </h3>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              <strong>Challenge:</strong> Random strangers carry payment data on their phones. How do we stop them from tampering or reading amounts?
            </p>
            <p className="text-zinc-800 leading-relaxed text-[11px] pt-1.5 border-t border-zinc-200">
              <strong>Solution:</strong> Hybrid RSA-2048 + AES-256-GCM. GCM is authenticated encryption: any single-bit modification causes decryption to abort with an authentication tag failure.
            </p>
          </div>

          {/* Problem 2 */}
          <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-2">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>2. The Duplicate-Storm</span>
            </h3>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              <strong>Challenge:</strong> Multiple bridge nodes holding the same packet walk outside simultaneously and POST to <code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded font-mono">/ingest</code> within milliseconds.
            </p>
            <p className="text-zinc-800 leading-relaxed text-[11px] pt-1.5 border-t border-zinc-200">
              <strong>Solution:</strong> Atomic compare-and-set claim on <code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded font-mono">SHA-256(ciphertext)</code>. Exactly one thread claims the hash; concurrent duplicates are dropped before ledger debit.
            </p>
          </div>

          {/* Problem 3 */}
          <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-2">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>3. Replay Attacks</span>
            </h3>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              <strong>Challenge:</strong> An adversary who intercepted an encrypted packet weeks ago could replay it to re-debit the sender.
            </p>
            <p className="text-zinc-800 leading-relaxed text-[11px] pt-1.5 border-t border-zinc-200">
              <strong>Solution:</strong> Two-layer protection. Every payload contains an immutable UUID nonce and timestamp (<code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded font-mono">signedAt</code>). The server rejects packets older than 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Function-by-Function Reference */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-6 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-rose-600" />
          Backend Service Architecture &amp; Function Reference
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-1.5">
            <div className="font-mono font-semibold text-rose-700 text-xs">HybridCryptoService.js</div>
            <p className="text-zinc-600 text-[11px]">
              Implements <code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded">encrypt(instruction)</code>, <code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded">decrypt(ciphertext)</code>, and <code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded">hashCiphertext(ciphertext)</code> using Node.js built-in <code className="text-zinc-800 font-mono">crypto</code>. Wire-compatible with Java Spring Boot.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-1.5">
            <div className="font-mono font-semibold text-purple-700 text-xs">IdempotencyService.js</div>
            <p className="text-zinc-600 text-[11px]">
              Implements atomic <code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded">claim(packetHash)</code> with a 24-hour TTL, mimicking Redis <code className="text-zinc-800 font-mono">SET key val NX EX 86400</code> for distributed deduplication.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-1.5">
            <div className="font-mono font-semibold text-emerald-700 text-xs">MeshSimulatorService.js</div>
            <p className="text-zinc-600 text-[11px]">
              Simulates virtual mobile devices and executes multi-device Bluetooth gossip rounds (<code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded">gossipOnce()</code>) with TTL decrementing per hop.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-rose-300 hover:bg-white transition-all space-y-1.5">
            <div className="font-mono font-semibold text-blue-700 text-xs">SettlementService.js &amp; DB</div>
            <p className="text-zinc-600 text-[11px]">
              Executes atomic ACID ledger settlement (<code className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded">settle()</code>) with balance checks, optimistic locking version counters, and unique constraints on transaction hashes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
