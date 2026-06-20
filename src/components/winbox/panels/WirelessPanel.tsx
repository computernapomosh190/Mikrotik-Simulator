import { useState } from 'react';
import { Wifi } from 'lucide-react';

interface WlanInterface {
  name: string;
  mode: string;
  ssid: string;
  band: string;
  channel: string;
  macAddress: string;
  txPower: string;
  enabled: boolean;
  clients: number;
}

const DEFAULT_WLANS: WlanInterface[] = [
  {
    name: 'wlan1',
    mode: 'ap bridge',
    ssid: 'MikroTik',
    band: '2ghz-b/g/n',
    channel: '6',
    macAddress: 'DC:2C:6E:AB:12:34',
    txPower: '20 dBm',
    enabled: true,
    clients: 3,
  },
];

export function WirelessPanel() {
  const [tab, setTab] = useState<'interfaces' | 'profiles' | 'access_list' | 'connect_list' | 'registration'>('interfaces');
  const [wlans] = useState<WlanInterface[]>(DEFAULT_WLANS);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-[#101E2D]">
      {/* Tabs */}
      <div className="flex border-b border-[#2A3F55] bg-[#1A2B3C] overflow-x-auto">
        {[
          ['interfaces', 'Interfaces'],
          ['profiles', 'Security Profiles'],
          ['access_list', 'Access List'],
          ['connect_list', 'Connect List'],
          ['registration', 'Registration Table'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
              tab === key ? 'bg-[#101E2D] text-white border-b-2 border-[#1B6EBE]' : 'text-[#8BA3BF] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2A3F55]">
        <button className="px-2 py-0.5 bg-[#1B6EBE] text-white rounded text-xs">+ Add</button>
        <button className="px-2 py-0.5 bg-[#1A2B3C] border border-[#2A3F55] text-[#8BA3BF] rounded text-xs">Enable</button>
        <button className="px-2 py-0.5 bg-[#1A2B3C] border border-[#2A3F55] text-[#8BA3BF] rounded text-xs">Disable</button>
        <div className="flex-1" />
        <input placeholder="Find..." className="px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-xs text-[#C8D6E5] outline-none w-24" />
      </div>

      {tab === 'interfaces' && (
        <>
          <div className="grid text-xs text-[#4A90D9] bg-[#142030] border-b border-[#2A3F55]" style={{ gridTemplateColumns: '24px 80px 80px 1fr 80px 60px 80px 60px' }}>
            {['', 'Name', 'Mode', 'SSID', 'Band', 'Ch', 'MAC', 'Clients'].map((h) => (
              <div key={h} className="px-2 py-1.5 font-medium">{h}</div>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {wlans.map((w) => (
              <div
                key={w.name}
                onClick={() => setSelected(w.name)}
                className={`grid text-xs border-b border-[#1A2B3C] cursor-pointer transition-colors ${
                  selected === w.name ? 'bg-[#1B4973]' : 'hover:bg-[#1A2B3C]'
                } text-[#C8D6E5]`}
                style={{ gridTemplateColumns: '24px 80px 80px 1fr 80px 60px 80px 60px' }}
              >
                <div className="px-2 py-1.5 flex items-center">
                  <Wifi className={`w-3 h-3 ${w.enabled ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
                <div className="px-2 py-1.5">{w.name}</div>
                <div className="px-2 py-1.5 text-[#8BA3BF]">{w.mode}</div>
                <div className="px-2 py-1.5 text-yellow-400">{w.ssid}</div>
                <div className="px-2 py-1.5 text-[#8BA3BF]">{w.band}</div>
                <div className="px-2 py-1.5">{w.channel}</div>
                <div className="px-2 py-1.5 font-mono text-[#8BA3BF]">{w.macAddress}</div>
                <div className="px-2 py-1.5 text-green-400">{w.clients}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'registration' && (
        <div className="flex-1 flex items-center justify-center text-[#4A90D9] text-xs opacity-50">
          3 wireless clients connected
        </div>
      )}

      {tab !== 'interfaces' && tab !== 'registration' && (
        <div className="flex-1 flex items-center justify-center text-[#4A90D9] text-xs opacity-50">
          No entries
        </div>
      )}
    </div>
  );
}
