import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface IPv6Address {
  id: string;
  address: string;
  interface: string;
  advertise: boolean;
  disabled: boolean;
}

export function IPv6Panel() {
  const [tab, setTab] = useState<'addresses' | 'routes' | 'neighbors' | 'settings' | 'nd'>('addresses');
  const [addresses, setAddresses] = useState<IPv6Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ address: '', interface: 'ether1', advertise: true });

  const addAddress = () => {
    if (!form.address) return;
    setAddresses((prev) => [...prev, { id: Date.now().toString(), ...form, disabled: false }]);
    setForm({ address: '', interface: 'ether1', advertise: true });
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#101E2D]">
      {/* Tabs */}
      <div className="flex border-b border-[#2A3F55] bg-[#1A2B3C] overflow-x-auto">
        {[
          ['addresses', 'Addresses'],
          ['routes', 'Routes'],
          ['neighbors', 'Neighbors'],
          ['settings', 'Settings'],
          ['nd', 'ND'],
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
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-2 py-0.5 bg-[#1B6EBE] text-white rounded text-xs">
          <Plus className="w-3 h-3" /> Add
        </button>
        <button className="flex items-center gap-1 px-2 py-0.5 bg-[#1A2B3C] border border-[#2A3F55] text-[#8BA3BF] rounded text-xs">
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      </div>

      {showForm && tab === 'addresses' && (
        <div className="px-3 py-2 bg-[#142030] border-b border-[#2A3F55] space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <label className="text-[#8BA3BF] w-24 shrink-0">Address</label>
            <input
              type="text"
              placeholder="e.g. 2001:db8::1/64"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="flex-1 px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs outline-none focus:border-[#4A90D9] font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[#8BA3BF] w-24 shrink-0">Interface</label>
            <select
              value={form.interface}
              onChange={(e) => setForm((f) => ({ ...f, interface: e.target.value }))}
              className="flex-1 px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs outline-none"
            >
              {['ether1', 'ether2', 'ether3', 'ether4', 'ether5'].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[#8BA3BF] w-24 shrink-0">Advertise</label>
            <input
              type="checkbox"
              checked={form.advertise}
              onChange={(e) => setForm((f) => ({ ...f, advertise: e.target.checked }))}
              className="rounded"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addAddress} className="px-3 py-1 bg-[#1B6EBE] text-white rounded text-xs">Add</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1 bg-[#1A2B3C] border border-[#2A3F55] text-[#8BA3BF] rounded text-xs">Cancel</button>
          </div>
        </div>
      )}

      {tab === 'addresses' && (
        <>
          <div className="grid text-xs text-[#4A90D9] bg-[#142030] border-b border-[#2A3F55]" style={{ gridTemplateColumns: '24px 1fr 100px 80px' }}>
            {['', 'Address', 'Interface', 'Advertise'].map((h) => (
              <div key={h} className="px-2 py-1.5 font-medium">{h}</div>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {addresses.map((a) => (
              <div key={a.id} className="grid text-xs text-[#C8D6E5] border-b border-[#1A2B3C] hover:bg-[#1A2B3C]" style={{ gridTemplateColumns: '24px 1fr 100px 80px' }}>
                <div className="px-2 py-1.5">
                  <div className={`w-2 h-2 rounded-full ${a.disabled ? 'bg-gray-500' : 'bg-green-400'}`} />
                </div>
                <div className="px-2 py-1.5 font-mono text-[#4A90D9]">{a.address}</div>
                <div className="px-2 py-1.5">{a.interface}</div>
                <div className="px-2 py-1.5">{a.advertise ? 'yes' : 'no'}</div>
              </div>
            ))}
            {addresses.length === 0 && (
              <div className="flex items-center justify-center h-full text-[#4A90D9] text-xs opacity-50">
                No IPv6 addresses configured
              </div>
            )}
          </div>
        </>
      )}

      {tab !== 'addresses' && (
        <div className="flex-1 flex items-center justify-center text-[#4A90D9] text-xs opacity-50">
          No entries
        </div>
      )}
    </div>
  );
}
