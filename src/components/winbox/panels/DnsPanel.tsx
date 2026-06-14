import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Search, Plus, Trash2, X, Globe } from 'lucide-react';

export function DnsPanel() {
  const dnsClients = useRouterStore((s) => s.dnsClients);
  const dnsStatic = useRouterStore((s) => s.dnsStatic);
  const addDnsStatic = useRouterStore((s) => s.addDnsStatic);
  const removeDnsStatic = useRouterStore((s) => s.removeDnsStatic);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatic, setSelectedStatic] = useState<string | null>(null);
  const [newStatic, setNewStatic] = useState({ name: '', address: '', ttl: '1d' });

  const handleAddStatic = () => {
    if (!newStatic.name || !newStatic.address) return;
    addDnsStatic(newStatic);
    setNewStatic({ name: '', address: '', ttl: '1d' });
    setShowAddModal(false);
  };

  const dnsClient = dnsClients[0] || { allowRemoteRequests: false, servers: '8.8.8.8', cacheSize: 2048 };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[#4A90D9]" />
          <h3 className="text-white font-medium">DNS</h3>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-3">
          <div className="bg-[#082035] rounded p-3 mb-4">
            <h4 className="text-sm font-medium text-[#4A90D9] mb-3">DNS Settings</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Servers:</span>{' '}
                <span className="text-white font-mono">{dnsClient.servers}</span>
              </div>
              <div>
                <span className="text-gray-500">Cache Size:</span>{' '}
                <span className="text-white">{dnsClient.cacheSize} KiB</span>
              </div>
              <div>
                <span className="text-gray-500">Allow Remote Requests:</span>{' '}
                <span className={dnsClient.allowRemoteRequests ? 'text-green-400' : 'text-red-400'}>
                  {dnsClient.allowRemoteRequests ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-[#4A90D9]">Static DNS Entries</h4>
            <div className="flex items-center gap-2">
              {selectedStatic && (
                <button
                  onClick={() => {
                    removeDnsStatic(selectedStatic);
                    setSelectedStatic(null);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="p-1 hover:bg-[#0D3258] rounded"
              >
                <Plus className="w-4 h-4 text-[#4A90D9]" />
              </button>
            </div>
          </div>

          {dnsStatic.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No static DNS entries</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#082035]">
                <tr className="text-left text-[#4A90D9]">
                  <th className="p-2">Name</th>
                  <th className="p-2">Address</th>
                  <th className="p-2">TTL</th>
                </tr>
              </thead>
              <tbody>
                {dnsStatic.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedStatic(entry.id)}
                    className={`border-b border-[#1B4973] cursor-pointer ${
                      selectedStatic === entry.id ? 'bg-[#1B4973]' : 'hover:bg-[#0D3258]'
                    }`}
                  >
                    <td className="p-2 text-white font-mono">{entry.name}</td>
                    <td className="p-2 text-gray-300 font-mono">{entry.address}</td>
                    <td className="p-2 text-gray-400">{entry.ttl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-80 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
              <h4 className="text-white font-medium">Add Static DNS</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#0D3258] rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Name</label>
                <input
                  type="text"
                  value={newStatic.name}
                  onChange={(e) => setNewStatic({ ...newStatic, name: e.target.value })}
                  placeholder="server.local"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Address</label>
                <input
                  type="text"
                  value={newStatic.address}
                  onChange={(e) => setNewStatic({ ...newStatic, address: e.target.value })}
                  placeholder="192.168.1.10"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">TTL</label>
                <input
                  type="text"
                  value={newStatic.ttl}
                  onChange={(e) => setNewStatic({ ...newStatic, ttl: e.target.value })}
                  placeholder="1d"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-3 border-t border-[#1B4973]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStatic}
                disabled={!newStatic.name || !newStatic.address}
                className="px-4 py-2 text-sm bg-[#2E86DE] text-white rounded hover:bg-[#2569B2] disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
