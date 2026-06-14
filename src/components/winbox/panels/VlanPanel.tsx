import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Layers, Plus, Trash2, X } from 'lucide-react';

export function VlanPanel() {
  const vlans = useRouterStore((s) => s.vlans);
  const addVlan = useRouterStore((s) => s.addVlan);
  const removeVlan = useRouterStore((s) => s.removeVlan);
  const bridges = useRouterStore((s) => s.bridges);
  const [selectedVlan, setSelectedVlan] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vlanId, setVlanId] = useState('10');
  const [vlanName, setVlanName] = useState('');
  const [vlanInterface, setVlanInterface] = useState('');

  const handleAddVlan = () => {
    if (!vlanId || !vlanInterface) return;
    addVlan({
      interface: vlanInterface,
      vlanId: parseInt(vlanId),
      name: vlanName || `vlan${vlanId}`,
      mtu: 1500,
    });
    setVlanId('10');
    setVlanName('');
    setVlanInterface('');
    setShowAddModal(false);
  };

  const getAvailableInterfaces = () => {
    const bridgeNames = bridges.map(b => b.name);
    return bridgeNames.length > 0 ? bridgeNames : ['bridge1'];
  };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-white font-medium">VLAN</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedVlan && (
            <button
              onClick={() => {
                removeVlan(selectedVlan);
                setSelectedVlan(null);
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
            title="Add VLAN"
          >
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {vlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Layers className="w-12 h-12 mb-2 opacity-30" />
            <p>No VLANs configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-[#4A90D9] hover:text-white"
            >
              Add VLAN
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#082035]">
              <tr className="text-left text-[#4A90D9]">
                <th className="p-2 w-6"></th>
                <th className="p-2">Name</th>
                <th className="p-2">Interface</th>
                <th className="p-2">VLAN ID</th>
                <th className="p-2">MTU</th>
              </tr>
            </thead>
            <tbody>
              {vlans.map((vlan) => (
                <tr
                  key={vlan.id}
                  onClick={() => setSelectedVlan(vlan.id)}
                  className={`border-b border-[#1B4973] cursor-pointer transition-colors ${
                    selectedVlan === vlan.id ? 'bg-[#1B4973]' : 'hover:bg-[#0D3258]'
                  }`}
                >
                  <td className="p-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </td>
                  <td className="p-2 text-white">{vlan.name}</td>
                  <td className="p-2 text-gray-300">{vlan.interface}</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                      {vlan.vlanId}
                    </span>
                  </td>
                  <td className="p-2 text-gray-300">{vlan.mtu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-96 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
              <h4 className="text-white font-medium">Add VLAN Interface</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#0D3258] rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">VLAN ID</label>
                <input
                  type="number"
                  value={vlanId}
                  onChange={(e) => setVlanId(e.target.value)}
                  placeholder="10"
                  min="1"
                  max="4094"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={vlanName}
                  onChange={(e) => setVlanName(e.target.value)}
                  placeholder={`vlan${vlanId}`}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Interface</label>
                <select
                  value={vlanInterface}
                  onChange={(e) => setVlanInterface(e.target.value)}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                >
                  <option value="">Select interface</option>
                  {getAvailableInterfaces().map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
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
                onClick={handleAddVlan}
                disabled={!vlanId || !vlanInterface}
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
