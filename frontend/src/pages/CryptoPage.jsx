import React, { useState } from 'react';
import { KeyRound, Shield, Copy, Check, Eye, EyeOff, Lock, Hash } from 'lucide-react';

export default function CryptoPage({ serverKey, lastPacket }) {
  const [copied, setCopied] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);

  const handleCopyKey = () => {
    if (!serverKey?.publicKey) return;
    navigator.clipboard.writeText(serverKey.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-600" />
            Cryptographic Specs &amp; Key Inspector
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Zero-Trust hybrid encryption (RSA-2048 + AES-256-GCM) protecting mesh wire payloads
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 font-mono font-medium">
          RSA-OAEP-SHA256 &bull; AES-GCM-256
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Server RSA-2048 Public Key Terminal Card */}
        <div className="bg-white border border-rose-100/90 rounded-2xl p-5 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              Server Public Key (RSA-2048)
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowFullKey(!showFullKey)}
                className="px-2 py-1 rounded bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 text-[10px] font-mono transition-colors border border-zinc-200"
              >
                {showFullKey ? 'Collapse' : 'Expand'}
              </button>
              <button
                onClick={handleCopyKey}
                className="px-2 py-1 rounded bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 text-[10px] font-mono transition-colors border border-zinc-200 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Senders use this public key offline to encrypt a fresh, one-time AES session key. Only the central server holds the private key required to decrypt.
          </p>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-[11px] text-zinc-800 break-all max-h-36 overflow-y-auto leading-relaxed shadow-inner">
            {serverKey?.publicKey
              ? showFullKey
                ? serverKey.publicKey
                : `${serverKey.publicKey.substring(0, 160)}...`
              : 'Loading server public key...'}
          </div>

          <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between border-t border-zinc-100 pt-2">
            <span>Algorithm: RSA-2048</span>
            <span>Padding: OAEP (SHA-256)</span>
          </div>
        </div>

        {/* 2. Mesh Packet Wire-Format Breakdown */}
        <div className="bg-white border border-rose-100/90 rounded-2xl p-5 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            Packet Wire Format (Byte Packing)
          </h2>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Before transmission over Bluetooth mesh, all components are packed sequentially and base64 encoded:
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800">
              <span className="font-semibold text-rose-700">[ Bytes 0 – 255 ]</span> : RSA-OAEP Encrypted 32-byte AES Session Key
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800">
              <span className="font-semibold text-purple-700">[ Bytes 256 – 267 ]</span> : 12-byte GCM Initialization Vector (IV)
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800">
              <span className="font-semibold text-emerald-700">[ Bytes 268+ ]</span> : AES-256-GCM Ciphertext + 16-byte Auth Tag
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200/60 text-[11px] text-rose-950 leading-relaxed">
            <strong>Authenticated Encryption:</strong> If an intermediate modifies even 1 bit in the ciphertext or tag, decryption fails with an OpenSSL authentication error and the packet is immediately dropped.
          </div>
        </div>
      </div>

      {/* 3. Packet Inspector */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-5 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-rose-600" />
          Last Injected Packet Inspector
        </h2>

        {lastPacket ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono font-medium">Packet ID</span>
                <span className="font-mono text-zinc-900 font-semibold text-xs">{lastPacket.packetId}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono font-medium">Injected Origin</span>
                <span className="font-mono text-rose-700 font-semibold text-xs">{lastPacket.injectedAt}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono font-medium">Time-to-Live (TTL)</span>
                <span className="font-mono text-emerald-700 font-semibold text-xs">{lastPacket.ttl} hops</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-600 text-xs block mb-1 font-medium">Full Encrypted Ciphertext (Base64):</span>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-[10px] text-zinc-600 break-all max-h-24 overflow-y-auto">
                {lastPacket.ciphertextFull || lastPacket.ciphertextPreview}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-zinc-400">
            No packet injected yet in this session. Go to the Home page and click "Encrypt &amp; Inject into Mesh" to inspect the packet here.
          </div>
        )}
      </div>
    </div>
  );
}
