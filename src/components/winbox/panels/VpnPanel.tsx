import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Lock, Plus, Trash2, X, Key } from 'lucide-react';

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + '=';
}

export function VpnPanel() {
  const wireGuardPeers = useRouterStore((s) => s.wireGuardPeers);
  const addWireGuardPeer = useRouterStore((s) => s.addWireGuardPeer);
  const removeWireGuardPeer = useRouterStore((s) => s.removeWireGuardPeer);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPeer, setNewPeer] = useState({
    name: 'wg1',
    privateKey: '',
    publicKey: '',
    endpoint: '',
    allowedAddress: '0.0.0.0/0',
    listenPort: 51820,
    persistentKeepalive: 25,
  });

  const handleAddPeer = () => {
    const privateKey = newPeer.privateKey || generateKey();
    const publicKey = generateKey();
    addWireGuardPeer({
      ...newPeer,
      privateKey,
      publicKey,
    });
    setNewPeer({
      name: 'wg1',
      privateKey: '',
      publicKey: '',
      endpoint: '',
      allowedAddress: '0.0.0.0/0',
      listenPort: 51820,
      persistentKeepalive: 25,
    });
    setShowAddModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          <h3 className="text-white font-medium">VPN</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedPeer && (
            <button
              onClick={() => {
                removeWireGuardPeer(selectedPeer);
                setSelectedPeer(null);
              }}
              className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
              title="Remove"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 hover:bg-[#0D3258] rounded transition-colors"
            title="Add WireGuard Interface"
          >
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {wireGuardPeers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Lock className="w-12 h-12 mb-2 opacity-30" />
            <p>No VPN interfaces configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-[#4A90D9] hover:text-white"
            >
              Add WireGuard Interface
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {wireGuardPeers.map((peer) => (
              <div
                key={peer.id}
                onClick={() => setSelectedPeer(peer.id)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedPeer === peer.id
                    ? 'bg-[#1B4973]'
                    : 'bg-[#082035] hover:bg-[#0D3258]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{peer.name}</span>
                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">WireGuard</span>
                  </div>
                  <span className="text-xs text-gray-400">:{peer.listenPort}</span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    <span className="font-mono truncate">{peer.publicKey.substring(0, 20)}...</span>
                  </div>
                  {peer.endpoint && (
                    <div>Endpoint: {peer.endpoint}</div>
                  )}
                  <div>Allowed: {peer.allowedAddress}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-80 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
              <h4 className="text-white font-medium">Add WireGuard Interface</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#0D3258] rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Name</label>
                <input
                  type="text"
                  value={newPeer.name}
                  onChange={(e) => setNewPeer({ ...newPeer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Listen Port</label>
                <input
                  type="number"
                  value={newPeer.listenPort}
                  onChange={(e) => setNewPeer({ ...newPeer, listenPort: parseInt(e.target.value) || 51820 })}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Private Key (leave empty to generate)</label>
                <input
                  type="text"
                  value={newPeer.privateKey}
                  onChange={(e) => setNewPeer({ ...newPeer, privateKey: e.target.value })}
                  placeholder="Auto-generate"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Peer Endpoint (optional)</label>
                <input
                  type="text"
                  value={newPeer.endpoint}
                  onChange={(e) => setNewPeer({ ...newPeer, endpoint: e.target.value })}
                  placeholder="peer.example.com:51820"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Allowed Address</label>
                <input
                  type="text"
                  value={newPeer.allowedAddress}
                  onChange={(e) => setNewPeer({ ...newPeer, allowedAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Keepalive</label>
                <input
                  type="number"
                  value={newPeer.persistentKeepalive}
                  onChange={(e) => setNewPeer({ ...newPeer, persistentKeepalive: parseInt(e.target.value) || 25 })}
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
                onClick={handleAddPeer}
                disabled={!newPeer.name}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
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
