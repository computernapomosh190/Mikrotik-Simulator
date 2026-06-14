import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Box, Plus, Trash2, Edit, X, Check } from 'lucide-react';

export function BridgePanel() {
  const bridges = useRouterStore((s) => s.bridges);
  const addBridge = useRouterStore((s) => s.addBridge);
  const removeBridge = useRouterStore((s) => s.removeBridge);
  const interfaces = useRouterStore((s) => s.interfaces);
  const [selectedBridge, setSelectedBridge] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bridgeName, setBridgeName] = useState('bridge1');
  const [selectedPorts, setSelectedPorts] = useState<string[]>([]);
  const [vlanFiltering, setVlanFiltering] = useState(false);

  const handleAddBridge = () => {
    if (!bridgeName) return;
    addBridge({
      name: bridgeName,
      ports: selectedPorts.map(p => ({ interface: p })),
      vlanFiltering,
      protocolMode: 'rstp',
    });
    setBridgeName('bridge1');
    setSelectedPorts([]);
    setVlanFiltering(false);
    setShowAddModal(false);
  };

  const togglePort = (port: string) => {
    setSelectedPorts(prev =>
      prev.includes(port)
        ? prev.filter(p => p !== port)
        : [...prev, port]
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-[#4A90D9]" />
          <h3 className="text-white font-medium">Bridge</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedBridge && (
            <button
              onClick={() => {
                removeBridge(selectedBridge);
                setSelectedBridge(null);
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
            title="Add Bridge"
          >
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {bridges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Box className="w-12 h-12 mb-2 opacity-30" />
            <p>No bridges configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-[#4A90D9] hover:text-white"
            >
              Add Bridge
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {bridges.map((bridge) => (
              <div
                key={bridge.id}
                onClick={() => setSelectedBridge(bridge.id)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedBridge === bridge.id
                    ? 'bg-[#1B4973]'
                    : 'bg-[#082035] hover:bg-[#0D3258]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{bridge.name}</span>
                  <div className="flex items-center gap-2">
                    {bridge.vlanFiltering && (
                      <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                        VLAN Filtering
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Ports: {bridge.ports.map(p => p.interface).join(', ') || 'none'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-96 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
              <h4 className="text-white font-medium">Add Bridge</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#0D3258] rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Bridge Name</label>
                <input
                  type="text"
                  value={bridgeName}
                  onChange={(e) => setBridgeName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-2">Ports</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {interfaces.filter(i => i.type === 'ether').map((iface) => (
                    <label
                      key={iface.id}
                      className="flex items-center gap-2 p-2 hover:bg-[#0D3258] rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPorts.includes(iface.name)}
                        onChange={() => togglePort(iface.name)}
                        className="rounded bg-[#082035] border-[#1B4973]"
                      />
                      <span className="text-sm text-gray-300">{iface.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vlanFilter"
                  checked={vlanFiltering}
                  onChange={(e) => setVlanFiltering(e.target.checked)}
                  className="rounded bg-[#082035] border-[#1B4973]"
                />
                <label htmlFor="vlanFilter" className="text-sm text-gray-300">VLAN Filtering</label>
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
                onClick={handleAddBridge}
                disabled={!bridgeName}
                className="px-4 py-2 text-sm bg-[#2E86DE] text-white rounded hover:bg-[#2569B2] disabled:opacity-50 disabled:cursor-not-allowed"
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
