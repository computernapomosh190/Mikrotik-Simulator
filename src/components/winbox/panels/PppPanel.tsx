import { useState } from 'react';
import { Plus } from 'lucide-react';

interface PppInterface {
  id: string;
  name: string;
  type: 'pppoe-client' | 'pptp-client' | 'l2tp-client' | 'sstp-client' | 'pppoe-server';
  server: string;
  user: string;
  status: 'connected' | 'disconnected';
  uptime?: string;
  ip?: string;
}

export function PppPanel() {
  const [tab, setTab] = useState<'interfaces' | 'pppoe-servers' | 'secrets' | 'profiles' | 'aaa'>('interfaces');
  const [interfaces, setInterfaces] = useState<PppInterface[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: 'pppoe-out1', type: 'pppoe-client' as const, server: '', user: '', password: '' });

  const addInterface = () => {
    if (!form.name) return;
    setInterfaces((prev) => [...prev, { id: Date.now().toString(), ...form, status: 'disconnected' }]);
    setShowForm(false);
    setForm({ name: 'pppoe-out1', type: 'pppoe-client', server: '', user: '', password: '' });
  };

  return (
    <div className="h-full flex flex-col bg-[#101E2D]">
      {/* Tabs */}
      <div className="flex border-b border-[#2A3F55] bg-[#1A2B3C] overflow-x-auto">
        {[
          ['interfaces', 'Interface'],
          ['pppoe-servers', 'PPPoE Servers'],
          ['secrets', 'Secrets'],
          ['profiles', 'Profiles'],
          ['aaa', 'AAA'],
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
        <select className="px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-[#C8D6E5] text-xs outline-none">
          <option>PPPoE Client</option>
          <option>PPTP Client</option>
          <option>L2TP Client</option>
          <option>SSTP Client</option>
        </select>
      </div>

      {/* Add form */}
      {showForm && tab === 'interfaces' && (
        <div className="px-3 py-2 bg-[#142030] border-b border-[#2A3F55] space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Name', key: 'name' },
              { label: 'Server', key: 'server', placeholder: 'IP or hostname' },
              { label: 'User', key: 'user' },
              { label: 'Password', key: 'password' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-[#8BA3BF] w-20 shrink-0">{label}</label>
                <input
                  type={key === 'password' ? 'password' : 'text'}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="flex-1 px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs outline-none focus:border-[#4A90D9]"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addInterface} className="px-3 py-1 bg-[#1B6EBE] text-white rounded text-xs">Add</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1 bg-[#1A2B3C] border border-[#2A3F55] text-[#8BA3BF] rounded text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="grid text-xs text-[#4A90D9] bg-[#142030] border-b border-[#2A3F55]" style={{ gridTemplateColumns: '24px 1fr 100px 1fr 80px 100px' }}>
        {['', 'Name', 'Type', 'User', 'Status', 'Uptime'].map((h) => (
          <div key={h} className="px-2 py-1.5 font-medium">{h}</div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'interfaces' && interfaces.map((iface) => (
          <div key={iface.id} className="grid text-xs text-[#C8D6E5] border-b border-[#1A2B3C] hover:bg-[#1A2B3C]" style={{ gridTemplateColumns: '24px 1fr 100px 1fr 80px 100px' }}>
            <div className="px-2 py-1.5 flex items-center">
              <div className={`w-2 h-2 rounded-full ${iface.status === 'connected' ? 'bg-green-400' : 'bg-gray-500'}`} />
            </div>
            <div className="px-2 py-1.5">{iface.name}</div>
            <div className="px-2 py-1.5 text-[#8BA3BF]">{iface.type}</div>
            <div className="px-2 py-1.5">{iface.user}</div>
            <div className={`px-2 py-1.5 ${iface.status === 'connected' ? 'text-green-400' : 'text-gray-400'}`}>{iface.status}</div>
            <div className="px-2 py-1.5 text-[#8BA3BF]">{iface.uptime || '-'}</div>
          </div>
        ))}
        {tab !== 'interfaces' && (
          <div className="flex items-center justify-center h-full text-[#4A90D9] text-xs opacity-50">No entries</div>
        )}
        {tab === 'interfaces' && interfaces.length === 0 && !showForm && (
          <div className="flex items-center justify-center h-full text-[#4A90D9] text-xs opacity-50">
            No PPP interfaces configured
          </div>
        )}
      </div>
    </div>
  );
}
