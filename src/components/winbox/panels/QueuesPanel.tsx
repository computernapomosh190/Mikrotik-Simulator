import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface SimpleQueue {
  id: string;
  name: string;
  target: string;
  maxUpload: string;
  maxDownload: string;
  enabled: boolean;
}

export function QueuesPanel() {
  const [tab, setTab] = useState<'simple' | 'tree' | 'types'>('simple');
  const [queues, setQueues] = useState<SimpleQueue[]>([
    { id: '1', name: 'client-limit', target: '192.168.1.0/24', maxUpload: '10M', maxDownload: '20M', enabled: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', maxUpload: '10M', maxDownload: '10M' });

  const addQueue = () => {
    if (!form.name || !form.target) return;
    setQueues((prev) => [
      ...prev,
      { id: Date.now().toString(), ...form, enabled: true },
    ]);
    setForm({ name: '', target: '', maxUpload: '10M', maxDownload: '10M' });
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#101E2D]">
      {/* Tabs */}
      <div className="flex border-b border-[#2A3F55] bg-[#1A2B3C]">
        {(['simple', 'tree', 'types'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs capitalize transition-colors ${
              tab === t ? 'bg-[#101E2D] text-white border-b-2 border-[#1B6EBE]' : 'text-[#8BA3BF] hover:text-white'
            }`}
          >
            {t === 'simple' ? 'Simple Queues' : t === 'tree' ? 'Queue Tree' : 'Queue Types'}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2A3F55]">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#1B6EBE] hover:bg-[#1557A0] text-white rounded text-xs"
        >
          <Plus className="w-3 h-3" /> New
        </button>
        <button
          onClick={() => setQueues([])}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#1A2B3C] border border-[#2A3F55] hover:bg-[#243549] text-[#8BA3BF] rounded text-xs"
        >
          <Trash2 className="w-3 h-3" /> Remove All
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-3 py-2 bg-[#142030] border-b border-[#2A3F55] grid grid-cols-2 gap-2">
          {[
            { label: 'Name', key: 'name' },
            { label: 'Target', key: 'target', placeholder: '192.168.1.0/24' },
            { label: 'Max Upload', key: 'maxUpload', placeholder: '10M' },
            { label: 'Max Download', key: 'maxDownload', placeholder: '10M' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex items-center gap-2">
              <label className="text-[#8BA3BF] text-xs w-24 shrink-0">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="flex-1 px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs outline-none focus:border-[#4A90D9]"
              />
            </div>
          ))}
          <div className="col-span-2 flex gap-2 mt-1">
            <button onClick={addQueue} className="px-3 py-1 bg-[#1B6EBE] text-white rounded text-xs">Add</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1 bg-[#1A2B3C] border border-[#2A3F55] text-[#8BA3BF] rounded text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Table header */}
      <div className="grid text-xs text-[#4A90D9] bg-[#142030] border-b border-[#2A3F55]" style={{ gridTemplateColumns: '24px 1fr 1fr 80px 80px 60px' }}>
        {['', 'Name', 'Target', 'Max Upload', 'Max Download', 'Enabled'].map((h, i) => (
          <div key={i} className="px-2 py-1.5 font-medium">{h}</div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'simple' && queues.map((q) => (
          <div
            key={q.id}
            className="grid text-xs text-[#C8D6E5] border-b border-[#1A2B3C] hover:bg-[#1A2B3C] transition-colors"
            style={{ gridTemplateColumns: '24px 1fr 1fr 80px 80px 60px' }}
          >
            <div className="px-2 py-1.5 flex items-center">
              <div className={`w-2 h-2 rounded-full ${q.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
            </div>
            <div className="px-2 py-1.5">{q.name}</div>
            <div className="px-2 py-1.5 text-[#8BA3BF]">{q.target}</div>
            <div className="px-2 py-1.5 text-yellow-400">{q.maxUpload}</div>
            <div className="px-2 py-1.5 text-green-400">{q.maxDownload}</div>
            <div className="px-2 py-1.5">{q.enabled ? 'yes' : 'no'}</div>
          </div>
        ))}
        {tab !== 'simple' && (
          <div className="flex items-center justify-center h-full text-[#4A90D9] text-xs opacity-50">
            No {tab === 'tree' ? 'queue tree' : 'custom queue types'} configured
          </div>
        )}
      </div>
    </div>
  );
}
