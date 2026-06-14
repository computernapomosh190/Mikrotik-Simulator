import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Server, Plus, Trash2, Edit, X } from 'lucide-react';

export function DhcpPanel() {
  const dhcpServers = useRouterStore((s) => s.dhcpServers);
  const addDhcpServer = useRouterStore((s) => s.addDhcpServer);
  const removeDhcpServer = useRouterStore((s) => s.removeDhcpServer);
  const interfaces = useRouterStore((s) => s.interfaces);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [serverConfig, setServerConfig] = useState({
    name: 'dhcp1',
    interface: '',
    addressPool: '192.168.88.100-192.168.88.200',
    gateway: '192.168.88.1',
    dnsServer: '8.8.8.8',
    leaseTime: '10m',
    disabled: false,
  });

  const handleAddServer = () => {
    if (!serverConfig.interface) return;
    addDhcpServer(serverConfig);
    setServerConfig({
      name: 'dhcp1',
      interface: '',
      addressPool: '192.168.88.100-192.168.88.200',
      gateway: '192.168.88.1',
      dnsServer: '8.8.8.8',
      leaseTime: '10m',
      disabled: false,
    });
    setShowAddModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#4A90D9]" />
          <h3 className="text-white font-medium">DHCP Server</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedServer && (
            <button
              onClick={() => {
                removeDhcpServer(selectedServer);
                setSelectedServer(null);
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
            title="Add DHCP Server"
          >
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {dhcpServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Server className="w-12 h-12 mb-2 opacity-30" />
            <p>No DHCP servers configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-[#4A90D9] hover:text-white"
            >
              Add DHCP Server
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {dhcpServers.map((server) => (
              <div
                key={server.id}
                onClick={() => setSelectedServer(server.id)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedServer === server.id
                    ? 'bg-[#1B4973]'
                    : 'bg-[#082035] hover:bg-[#0D3258]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{server.name}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      server.disabled
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {server.disabled ? 'Disabled' : 'Running'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Interface:</span>{' '}
                    <span className="text-gray-300">{server.interface}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Pool:</span>{' '}
                    <span className="text-gray-300">{server.addressPool}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gateway:</span>{' '}
                    <span className="text-gray-300">{server.gateway}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">DNS:</span>{' '}
                    <span className="text-gray-300">{server.dnsServer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-96 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973] sticky top-0 bg-[#0B2942]">
              <h4 className="text-white font-medium">Add DHCP Server</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#0D3258] rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Name</label>
                <input
                  type="text"
                  value={serverConfig.name}
                  onChange={(e) => setServerConfig({ ...serverConfig, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Interface</label>
                <select
                  value={serverConfig.interface}
                  onChange={(e) => setServerConfig({ ...serverConfig, interface: e.target.value })}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                >
                  <option value="">Select interface</option>
                  {interfaces.filter(i => i.enabled).map((iface) => (
                    <option key={iface.id} value={iface.name}>{iface.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Address Pool</label>
                <input
                  type="text"
                  value={serverConfig.addressPool}
                  onChange={(e) => setServerConfig({ ...serverConfig, addressPool: e.target.value })}
                  placeholder="192.168.88.100-192.168.88.200"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Gateway</label>
                <input
                  type="text"
                  value={serverConfig.gateway}
                  onChange={(e) => setServerConfig({ ...serverConfig, gateway: e.target.value })}
                  placeholder="192.168.88.1"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">DNS Server</label>
                <input
                  type="text"
                  value={serverConfig.dnsServer}
                  onChange={(e) => setServerConfig({ ...serverConfig, dnsServer: e.target.value })}
                  placeholder="8.8.8.8"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Lease Time</label>
                <input
                  type="text"
                  value={serverConfig.leaseTime}
                  onChange={(e) => setServerConfig({ ...serverConfig, leaseTime: e.target.value })}
                  placeholder="10m"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={serverConfig.disabled}
                  onChange={(e) => setServerConfig({ ...serverConfig, disabled: e.target.checked })}
                  className="rounded bg-[#082035] border-[#1B4973]"
                />
                <label htmlFor="disabled" className="text-sm text-gray-300">Disabled</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-3 border-t border-[#1B4973] sticky bottom-0 bg-[#0B2942]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddServer}
                disabled={!serverConfig.interface}
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
