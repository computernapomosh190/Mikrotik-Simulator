import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Route, Plus, Trash2, X, ArrowRight } from 'lucide-react';

export function RoutingPanel() {
  const routes = useRouterStore((s) => s.routes);
  const addRoute = useRouterStore((s) => s.addRoute);
  const removeRoute = useRouterStore((s) => s.removeRoute);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoute, setNewRoute] = useState({
    dstAddress: '',
    gateway: '',
    distance: 1,
    checkGateway: '',
  });

  const handleAddRoute = () => {
    if (!newRoute.dstAddress || !newRoute.gateway) return;
    addRoute({
      ...newRoute,
      scope: 30,
      active: true,
    });
    setNewRoute({ dstAddress: '', gateway: '', distance: 1, checkGateway: '' });
    setShowAddModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-[#4A90D9]" />
          <h3 className="text-white font-medium">Routes</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedRoute && (
            <button
              onClick={() => {
                removeRoute(selectedRoute);
                setSelectedRoute(null);
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
            title="Add Route"
          >
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Route className="w-12 h-12 mb-2 opacity-30" />
            <p>No static routes configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-[#4A90D9] hover:text-white"
            >
              Add Static Route
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#082035]">
              <tr className="text-left text-[#4A90D9]">
                <th className="p-2 w-8"></th>
                <th className="p-2">Dst Address</th>
                <th className="p-2 w-8"></th>
                <th className="p-2">Gateway</th>
                <th className="p-2">Distance</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr
                  key={route.id}
                  onClick={() => setSelectedRoute(route.id)}
                  className={`border-b border-[#1B4973] cursor-pointer transition-colors ${
                    selectedRoute === route.id ? 'bg-[#1B4973]' : 'hover:bg-[#0D3258]'
                  }`}
                >
                  <td className="p-2">
                    <div className={`w-2 h-2 rounded-full ${route.active ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </td>
                  <td className="p-2 text-white font-mono">{route.dstAddress}</td>
                  <td className="p-2">
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </td>
                  <td className="p-2 text-gray-300 font-mono">{route.gateway}</td>
                  <td className="p-2 text-gray-400">{route.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-80 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
              <h4 className="text-white font-medium">Add Static Route</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#0D3258] rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Destination</label>
                <input
                  type="text"
                  value={newRoute.dstAddress}
                  onChange={(e) => setNewRoute({ ...newRoute, dstAddress: e.target.value })}
                  placeholder="10.0.0.0/24"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Gateway</label>
                <input
                  type="text"
                  value={newRoute.gateway}
                  onChange={(e) => setNewRoute({ ...newRoute, gateway: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Distance</label>
                <input
                  type="number"
                  min="1"
                  max="255"
                  value={newRoute.distance}
                  onChange={(e) => setNewRoute({ ...newRoute, distance: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Check Gateway (optional)</label>
                <select
                  value={newRoute.checkGateway}
                  onChange={(e) => setNewRoute({ ...newRoute, checkGateway: e.target.value })}
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                >
                  <option value="">None</option>
                  <option value="ping">ping</option>
                  <option value="arp">arp</option>
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
                onClick={handleAddRoute}
                disabled={!newRoute.dstAddress || !newRoute.gateway}
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
