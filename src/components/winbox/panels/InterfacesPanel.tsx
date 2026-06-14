import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Wifi, Power, RefreshCw, Plus, Trash2, Edit, X } from 'lucide-react';

export function InterfacesPanel() {
  const interfaces = useRouterStore((s) => s.interfaces);
  const toggleInterface = useRouterStore((s) => s.toggleInterface);
  const [selectedInterface, setSelectedInterface] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const getInterfaceType = (type: string) => {
    switch (type) {
      case 'ether':
        return { label: 'Ethernet', color: 'text-green-400' };
      case 'bridge':
        return { label: 'Bridge', color: 'text-blue-400' };
      case 'vlan':
        return { label: 'VLAN', color: 'text-purple-400' };
      default:
        return { label: type, color: 'text-gray-400' };
    }
  };

  const getSpeed = (enabled: boolean) => {
    if (!enabled) return 'disabled';
    return '1Gbps';
  };

  const filteredInterfaces = interfaces.filter(iface => {
    const type = getInterfaceType(iface.type);
    return type.label !== 'VLAN';
  });

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <h3 className="text-white font-medium">Interfaces</h3>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-[#0D3258] rounded transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-[#4A90D9]" />
          </button>
          <button className="p-1.5 hover:bg-[#0D3258] rounded transition-colors" title="Add Interface">
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#082035]">
            <tr className="text-left text-[#4A90D9]">
              <th className="p-2 w-8"></th>
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">MTU</th>
              <th className="p-2">MAC Address</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterfaces.map((iface) => {
              const type = getInterfaceType(iface.type);
              return (
                <tr
                  key={iface.id}
                  onClick={() => setSelectedInterface(iface.id)}
                  className={`border-b border-[#1B4973] cursor-pointer transition-colors ${
                    selectedInterface === iface.id
                      ? 'bg-[#1B4973]'
                      : 'hover:bg-[#0D3258]'
                  }`}
                >
                  <td className="p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleInterface(iface.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        iface.enabled
                          ? 'text-green-400 hover:bg-green-400/20'
                          : 'text-red-400 hover:bg-red-400/20'
                      }`}
                      title={iface.enabled ? 'Disable' : 'Enable'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-2 text-white">{iface.name}</td>
                  <td className="p-2">
                    <span className={`flex items-center gap-1 ${type.color}`}>
                      <Wifi className="w-3 h-3" />
                      {type.label}
                    </span>
                  </td>
                  <td className="p-2 text-gray-300">{iface.mtu}</td>
                  <td className="p-2 text-gray-300 font-mono text-xs">{iface.macAddress}</td>
                  <td className="p-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                        iface.enabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {iface.enabled ? getSpeed(true) : 'disabled'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedInterface && editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-96 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
              <h4 className="text-white font-medium">Edit Interface</h4>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-[#0D3258] rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-gray-400">Interface editing would open here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
