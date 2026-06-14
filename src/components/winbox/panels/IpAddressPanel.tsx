import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Plus, Trash2, Edit, X, Globe } from 'lucide-react';

export function IpAddressPanel() {
  const ipAddresses = useRouterStore((s) => s.ipAddresses);
  const addIpAddress = useRouterStore((s) => s.addIpAddress);
  const removeIpAddress = useRouterStore((s) => s.removeIpAddress);
  const interfaces = useRouterStore((s) => s.interfaces);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newInterface, setNewInterface] = useState('');
  const [newDisabled, setNewDisabled] = useState(false);

  const handleAddIp = () => {
    if (!newAddress || !newInterface) return;
    addIpAddress({
      address: newAddress,
      network: '',
      interface: newInterface,
      disabled: newDisabled,
    });
    setNewAddress('');
    setNewInterface('');
    setNewDisabled(false);
    setShowAddModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#4A90D9]" />
          <h3 className="text-white font-medium">IP Addresses</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedIp && (
            <>
              <button
                className="p-1.5 hover:bg-[#0D3258] rounded transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-[#4A90D9]" />
              </button>
              <button
                onClick={() => {
                  removeIpAddress(selectedIp);
                  setSelectedIp(null);
                }}
                className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 hover:bg-[#0D3258] rounded transition-colors"
            title="Add IP Address"
          >
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {ipAddresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Globe className="w-12 h-12 mb-2 opacity-30" />
            <p>No IP addresses configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-[#4A90D9] hover:text-white"
            >
              Add IP Address
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#082035]">
              <tr className="text-left text-[#4A90D9]">
                <th className="p-2 w-6"></th>
                <th className="p-2">Address</th>
                <th className="p-2">Network</th>
                <th className="p-2">Interface</th>
              </tr>
            </thead>
            <tbody>
              {ipAddresses.map((ip) => (
                <tr
                  key={ip.id}
                  onClick={() => setSelectedIp(ip.id)}
                  className={`border-b border-[#1B4973] cursor-pointer transition-colors ${
                    selectedIp === ip.id ? 'bg-[#1B4973]' : 'hover:bg-[#0D3258]'
                  }`}
                >
                  <td className="p-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        ip.disabled ? 'bg-red-400' : 'bg-green-400'
                      }`}
                    />
                  </td>
                  <td className="p-2 text-white font-mono">{ip.address}</td>
                  <td className="p-2 text-gray-300 font-mono">{ip.network}</td>
                  <td className="p-2 text-gray-300">{ip.interface}</td>
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
              <h4 className="text-white font-medium">Add IP Address</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[#0D3258] rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="192.168.1.1/24"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Interface</label>
                <select
                  value={newInterface}
                  onChange={(e) => setNewInterface(e.target.value)}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                >
                  <option value="">Select interface</option>
                  {interfaces.filter(i => i.enabled).map((iface) => (
                    <option key={iface.id} value={iface.name}>
                      {iface.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={newDisabled}
                  onChange={(e) => setNewDisabled(e.target.checked)}
                  className="rounded bg-[#082035] border-[#1B4973]"
                />
                <label htmlFor="disabled" className="text-sm text-gray-300">Disabled</label>
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
                onClick={handleAddIp}
                disabled={!newAddress || !newInterface}
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
