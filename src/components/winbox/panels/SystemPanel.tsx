import React, { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Settings, Cpu, Clock, Globe } from 'lucide-react';

export function SystemPanel() {
  const hostname = useRouterStore((s) => s.hostname);
  const [newHostname, setNewHostname] = useState(hostname);
  const setHostname = useRouterStore((s) => s.setHostname);

  const handleHostnameChange = () => {
    if (newHostname && newHostname !== hostname) {
      setHostname(newHostname);
    }
  };

  const stats = {
    cpu: Math.floor(Math.random() * 30) + 5,
    memory: 45,
    hdd: 23,
    uptime: '3d 14h 22m',
    routerboard: {
      model: 'MikroTik CHR',
      serialNumber: 'MTK' + Math.random().toString(36).substring(2, 12).toUpperCase(),
    },
    version: '7.15',
  };

  return (
    <div className="h-full overflow-auto bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#4A90D9]" />
          <h3 className="text-white font-medium">System</h3>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-[#082035] rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[#4A90D9]" />
            <h4 className="text-sm font-medium text-[#4A90D9]">Identity</h4>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHostname}
              onChange={(e) => setNewHostname(e.target.value)}
              className="flex-1 px-3 py-2 bg-navy-800 border border-[#1B4973] rounded text-white text-sm"
            />
            <button
              onClick={handleHostnameChange}
              disabled={newHostname === hostname || !newHostname}
              className="px-4 py-2 bg-[#2E86DE] text-white text-sm rounded hover:bg-[#2569B2] disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="bg-[#082035] rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-[#4A90D9]" />
            <h4 className="text-sm font-medium text-[#4A90D9]">RouterBOARD</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Model:</div>
            <div className="text-white">{stats.routerboard.model}</div>
            <div className="text-gray-400">Serial:</div>
            <div className="text-white font-mono text-xs">{stats.routerboard.serialNumber}</div>
            <div className="text-gray-400">RouterOS:</div>
            <div className="text-white">v{stats.version}</div>
          </div>
        </div>

        <div className="bg-[#082035] rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-[#4A90D9]" />
            <h4 className="text-sm font-medium text-[#4A90D9]">Resources</h4>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">CPU Load</span>
                <span className="text-white">{stats.cpu}%</span>
              </div>
              <div className="h-2 bg-navy-900 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded"
                  style={{ width: `${stats.cpu}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Memory</span>
                <span className="text-white">{stats.memory}%</span>
              </div>
              <div className="h-2 bg-navy-900 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2E86DE] to-[#2E86DE] rounded"
                  style={{ width: `${stats.memory}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">HDD</span>
                <span className="text-white">{stats.hdd}%</span>
              </div>
              <div className="h-2 bg-navy-900 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-500 rounded"
                  style={{ width: `${stats.hdd}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#082035] rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#4A90D9]" />
            <h4 className="text-sm font-medium text-[#4A90D9]">Uptime</h4>
          </div>
          <p className="text-xl font-mono text-white">{stats.uptime}</p>
        </div>
      </div>
    </div>
  );
}
