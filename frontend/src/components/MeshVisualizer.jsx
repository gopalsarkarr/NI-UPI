import React from 'react';
import { Smartphone, Wifi, WifiOff, BatteryCharging, Battery, Radio, Package } from 'lucide-react';

export default function MeshVisualizer({ devices = [], selectedDevice, onSelectDevice }) {
  // Realistic battery states for the devices
  const batteryLevels = {
    'phone-alice': 88,
    'phone-bob': 64,
    'phone-carol': 92,
    'phone-dave': 45,
    'phone-bridge': 79,
  };

  return (
    <div className="bg-white border border-rose-100/90 rounded-2xl p-5 shadow-[0_2px_8px_rgba(225,29,72,0.04)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100/70 pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-600" />
            Bluetooth Mesh Topology (Nearby Devices)
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Offline phones carry encrypted payment packets hop-by-hop until reaching an online bridge node
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            Offline BLE
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Bridge (4G Active)
          </span>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {devices.map((device) => {
          const isSelected = selectedDevice === device.deviceId;
          const hasPackets = device.packetCount > 0;
          const battery = batteryLevels[device.deviceId] || 80;

          return (
            <div
              key={device.deviceId}
              onClick={() => onSelectDevice && onSelectDevice(device)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-rose-400 bg-rose-50/60 shadow-sm'
                  : device.hasInternet
                  ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                  : 'border-zinc-200 bg-zinc-50/60 hover:border-rose-300 hover:bg-white'
              }`}
            >
              {/* Top Row: Device Icon & Net Badge */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    device.hasInternet
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-white text-zinc-700 border border-zinc-200 shadow-2xs'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </div>

                {device.hasInternet ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <Wifi className="w-2.5 h-2.5" />
                    4G Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-white text-zinc-500 border border-zinc-200">
                    <WifiOff className="w-2.5 h-2.5 text-zinc-400" />
                    No Internet
                  </span>
                )}
              </div>

              {/* Device Label */}
              <div className="font-semibold text-xs text-zinc-900">{device.deviceId}</div>
              <div className="text-[11px] text-zinc-500">
                {device.deviceId === 'phone-alice' && 'Alice (Sender)'}
                {device.deviceId === 'phone-bob' && 'Bob (Receiver)'}
                {device.deviceId === 'phone-carol' && 'Carol (Hop 1)'}
                {device.deviceId === 'phone-dave' && 'Dave (Hop 2)'}
                {device.deviceId === 'phone-bridge' && 'Bridge (Outside)'}
              </div>

              {/* Status footer: Battery & Packets */}
              <div className="mt-3 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1 text-zinc-500" title={`Battery: ${battery}%`}>
                  <Battery className="w-3 h-3 text-zinc-400" />
                  {battery}%
                </span>

                <span
                  className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    hasPackets
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'text-zinc-400'
                  }`}
                >
                  {device.packetCount} {device.packetCount === 1 ? 'packet' : 'packets'}
                </span>
              </div>

              {/* Packet pills */}
              {hasPackets && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {device.packetIds.map((pid, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono px-1 py-0.5 rounded bg-white text-rose-700 border border-rose-200 shadow-2xs"
                    >
                      #{pid}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
