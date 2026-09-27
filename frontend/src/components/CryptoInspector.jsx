import React, { useState } from 'react';
import { Key, Eye, EyeOff, Shield, Copy, Check } from 'lucide-react';

export default function CryptoInspector({ serverKey, lastPacket }) {
  const [copied, setCopied] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);

  const handleCopyKey = () => {
    if (!serverKey?.publicKey) return;
    navigator.clipboard.writeText(serverKey.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Cryptographic Specs & Key Inspector
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
          RSA-2048 / OAEP + AES-256-GCM
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Server Public Key Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-300">Server Public Key (RSA-2048)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFullKey(!showFullKey)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title={showFullKey ? 'Truncate' : 'Show full'}
              >
                {showFullKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleCopyKey}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy public key"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <p className="font-mono text-slate-400 break-all leading-relaxed bg-slate-900 p-2 rounded-lg border border-slate-800/60 max-h-24 overflow-y-auto">
            {serverKey?.publicKey
              ? showFullKey
                ? serverKey.publicKey
                : `${serverKey.publicKey.substring(0, 140)}...`
              : 'Loading key...'}
          </p>
          <div className="mt-2 text-[11px] text-slate-500">
            Senders use this key to encrypt the one-time AES session key.
          </div>
        </div>

        {/* Wire Protocol Layout */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="font-semibold text-slate-300 block mb-2">Mesh Packet Wire Format</span>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="p-1.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300">
              [ 0 - 255 bytes ] : RSA-OAEP Encrypted 32-byte AES Session Key
            </div>
            <div className="p-1.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-indigo-300">
              [ 256 - 267 bytes ] : 12-byte GCM Initialization Vector (IV)
            </div>
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              [ 268+ bytes ] : AES-256-GCM Ciphertext + 16-byte Auth Tag
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Intermediates cannot read or tamper. Any flipped bit breaks the GCM auth tag.
          </div>
        </div>
      </div>

      {lastPacket && (
        <div className="mt-4 p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs">
          <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Last Injected Packet (Simulated Sender)
          </div>
          <div className="font-mono text-slate-400 break-all">
            <strong>ID:</strong> {lastPacket.packetId} | <strong>TTL:</strong> {lastPacket.ttl} |{' '}
            <strong>Ciphertext:</strong> {lastPacket.ciphertextPreview}
          </div>
        </div>
      )}
    </div>
  );
}
