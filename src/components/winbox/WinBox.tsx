import { useState } from 'react';
import { useRouterStore } from '../../store/routerStore';
import { InterfacesPanel } from './panels/InterfacesPanel';
import { IpAddressPanel } from './panels/IpAddressPanel';
import { BridgePanel } from './panels/BridgePanel';
import { VlanPanel } from './panels/VlanPanel';
import { DhcpPanel } from './panels/DhcpPanel';
import { DnsPanel } from './panels/DnsPanel';
import { FirewallPanel } from './panels/FirewallPanel';
import { RoutingPanel } from './panels/RoutingPanel';
import { VpnPanel } from './panels/VpnPanel';
import { SystemPanel } from './panels/SystemPanel';
import {
  Wifi,
  Box,
  Layers,
  Globe,
  Server,
  Search,
  Shield,
  Route,
  Lock,
  Settings,
  Terminal,
  X,
  Minimize2,
  Maximize2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'interfaces', label: 'Interfaces', icon: Wifi },
  { id: 'ip', label: 'IP', icon: Globe, hasSubmenu: true },
  { id: 'bridge', label: 'Bridge', icon: Box },
  { id: 'vlan', label: 'VLAN', icon: Layers },
  { id: 'dhcp', label: 'DHCP', icon: Server },
  { id: 'dns', label: 'DNS', icon: Search },
  { id: 'firewall', label: 'Firewall', icon: Shield },
  { id: 'routing', label: 'Routing', icon: Route },
  { id: 'vpn', label: 'VPN', icon: Lock },
  { id: 'system', label: 'System', icon: Settings },
];

const IP_SUBMENU = [
  { id: 'ip-address', label: 'Addresses' },
  { id: 'ip-routes', label: 'Routes' },
  { id: 'ip-dns', label: 'DNS' },
  { id: 'ip-dhcp-client', label: 'DHCP Client' },
  { id: 'ip-dhcp-server', label: 'DHCP Server' },
];

interface WinBoxProps {
  onOpenTerminal: () => void;
}

function WinBoxLoginScreen({ onConnect }: { onConnect: () => void }) {
  const interfaces = useRouterStore((s) => s.interfaces);
  const [connectTo, setConnectTo] = useState(interfaces[0]?.macAddress || '00:11:22:33:44:01');
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const neighbors = [
    {
      mac: interfaces[0]?.macAddress || '00:11:22:33:44:01',
      ip: '',
      identity: 'MikroTik',
      version: '7.15',
      board: 'RB760iGS',
    },
  ];

  const handleConnect = async () => {
    if (!connectTo) {
      setError('Enter MAC or IP address');
      return;
    }
    if (login !== 'admin') {
      setError('Invalid login');
      return;
    }
    setConnecting(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));
    setConnecting(false);
    onConnect();
  };

  const handleSelectNeighbor = (mac: string) => {
    setConnectTo(mac);
  };

  return (
    <div className="h-full flex bg-[#E8E8E8] font-sans text-sm select-none">
      {/* Left panel */}
      <div className="w-[340px] bg-[#F0F0F0] border-r border-[#C0C0C0] flex flex-col">
        {/* MikroTik branding */}
        <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-[#1A1A2E] to-[#16213E]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#CC2936] font-black text-lg">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">mikrotik</span>
          </div>
          <p className="text-[#4A90D9] text-xs mt-1">RouterOS Management</p>
        </div>

        {/* Form */}
        <div className="flex-1 p-5 space-y-4">
          <div>
            <label className="block text-[#333] text-xs font-medium mb-1">Connect to</label>
            <input
              type="text"
              value={connectTo}
              onChange={(e) => setConnectTo(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#A0A0A0] rounded text-[#222] text-sm focus:outline-none focus:border-[#4A90D9]"
              placeholder="MAC or IP address"
            />
          </div>

          <div>
            <label className="block text-[#333] text-xs font-medium mb-1">Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#A0A0A0] rounded text-[#222] text-sm focus:outline-none focus:border-[#4A90D9]"
            />
          </div>

          <div>
            <label className="block text-[#333] text-xs font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#A0A0A0] rounded text-[#222] text-sm focus:outline-none focus:border-[#4A90D9]"
              placeholder="(empty)"
            />
            <p className="text-[#888] text-xs mt-1">Default: admin / (empty password)</p>
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-2 py-1">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex-1 py-1.5 bg-[#4A90D9] hover:bg-[#357ABD] text-white rounded text-sm font-medium transition-colors disabled:opacity-60"
            >
              {connecting ? 'Connecting...' : 'Connect'}
            </button>
            <button
              onClick={() => { setConnectTo(''); setLogin('admin'); setPassword(''); setError(''); }}
              className="px-3 py-1.5 bg-[#D0D0D0] hover:bg-[#C0C0C0] text-[#333] rounded text-sm transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 text-[#555] text-xs">
            <input type="checkbox" id="remember" className="rounded" />
            <label htmlFor="remember">Remember password</label>
          </div>
        </div>
      </div>

      {/* Right panel - Neighbors */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#E0E0E0] border-b border-[#C0C0C0]">
          <span className="text-[#444] text-xs font-medium">Select from:</span>
          <select className="px-2 py-1 bg-white border border-[#A0A0A0] rounded text-xs text-[#333] focus:outline-none">
            <option>Neighbors</option>
          </select>
          <div className="flex-1" />
          <button className="flex items-center gap-1 px-2 py-1 bg-white border border-[#A0A0A0] rounded text-xs text-[#333] hover:bg-[#F0F0F0]">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {/* Neighbors table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0">
              <tr className="bg-[#D8D8D8] border-b border-[#B8B8B8]">
                <th className="text-left px-3 py-1.5 font-medium text-[#333] w-8">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left px-3 py-1.5 font-medium text-[#333]">MAC Address</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#333]">IP Address</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#333]">Identity</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#333]">Version</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#333]">Board</th>
              </tr>
            </thead>
            <tbody>
              {neighbors.map((n) => (
                <tr
                  key={n.mac}
                  onClick={() => handleSelectNeighbor(n.mac)}
                  onDoubleClick={handleConnect}
                  className={`border-b border-[#E0E0E0] cursor-pointer hover:bg-[#D0E8FF] ${
                    connectTo === n.mac ? 'bg-[#B8D8FF]' : 'bg-white'
                  }`}
                >
                  <td className="px-3 py-1.5">
                    <input type="checkbox" className="rounded" checked={connectTo === n.mac} readOnly />
                  </td>
                  <td className="px-3 py-1.5 text-[#0000CC] font-mono">{n.mac}</td>
                  <td className="px-3 py-1.5 text-[#555]">{n.ip || '-'}</td>
                  <td className="px-3 py-1.5 text-[#333] font-medium">{n.identity}</td>
                  <td className="px-3 py-1.5 text-[#555]">{n.version}</td>
                  <td className="px-3 py-1.5 text-[#555]">{n.board}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-[#888] text-xs italic">
            Double-click a row to connect, or select and click Connect
          </p>
        </div>
      </div>
    </div>
  );
}

export function WinBox({ onOpenTerminal }: WinBoxProps) {
  const [activeMenu, setActiveMenu] = useState('interfaces');
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const hostname = useRouterStore((s) => s.hostname);
  const winboxConnected = useRouterStore((s) => s.winboxConnected);
  const setWinboxConnected = useRouterStore((s) => s.setWinboxConnected);

  const renderPanel = () => {
    if (activeSubMenu) {
      switch (activeSubMenu) {
        case 'ip-address':
          return <IpAddressPanel />;
        case 'ip-routes':
          return <RoutingPanel />;
        case 'ip-dns':
          return <DnsPanel />;
        case 'ip-dhcp-server':
          return <DhcpPanel />;
        default:
          return <IpAddressPanel />;
      }
    }

    switch (activeMenu) {
      case 'interfaces':
        return <InterfacesPanel />;
      case 'bridge':
        return <BridgePanel />;
      case 'vlan':
        return <VlanPanel />;
      case 'dhcp':
        return <DhcpPanel />;
      case 'dns':
        return <DnsPanel />;
      case 'firewall':
        return <FirewallPanel />;
      case 'routing':
        return <RoutingPanel />;
      case 'vpn':
        return <VpnPanel />;
      case 'system':
        return <SystemPanel />;
      default:
        return <InterfacesPanel />;
    }
  };

  const handleMenuClick = (menuId: string) => {
    if (menuId === 'ip') {
      setActiveSubMenu(activeSubMenu ? null : 'ip-address');
    } else {
      setActiveMenu(menuId);
      setActiveSubMenu(null);
    }
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-3 px-4 py-3 bg-[#0B2942] border border-[#1B4973] rounded-lg shadow-lg hover:bg-[#0D3258] transition-colors"
        >
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">MT</span>
          </div>
          <span className="text-white font-medium">{hostname}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#183557] to-[#0B2942] border-b border-[#1B4973] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">MT</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {winboxConnected ? hostname : 'WinBox 4.1'}
            </p>
            <p className="text-[#4A90D9] text-xs">
              {winboxConnected ? 'RouterOS v7.15' : 'Not connected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {winboxConnected && (
            <button
              onClick={onOpenTerminal}
              className="p-2 hover:bg-[#0D3258] rounded transition-colors text-[#4A90D9] hover:text-white"
              title="Open Terminal"
            >
              <Terminal className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMinimized(true)}
            className="p-1 hover:bg-[#0D3258] rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-[#4A90D9]" />
          </button>
          <button className="p-1 hover:bg-[#0D3258] rounded transition-colors">
            <Maximize2 className="w-4 h-4 text-[#4A90D9]" />
          </button>
          {winboxConnected && (
            <button
              onClick={() => setWinboxConnected(false)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
              title="Disconnect"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!winboxConnected ? (
        <div className="flex-1 overflow-hidden">
          <WinBoxLoginScreen onConnect={() => setWinboxConnected(true)} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-[#082035] border-r border-[#1B4973] overflow-y-auto">
            <div className="p-2 space-y-1">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id || (item.hasSubmenu && !!activeSubMenu);
                const hasSubmenu = item.hasSubmenu;

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
                        isActive
                          ? 'bg-[#1B4973] text-white'
                          : 'text-[#A0C4E8] hover:bg-[#0D3258] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-sm">{item.label}</span>
                      {hasSubmenu && (
                        <ChevronRight
                          className={`w-3 h-3 transition-transform ${
                            isActive && hasSubmenu ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </button>

                    {hasSubmenu && isActive && (
                      <div className="mt-1 ml-4 space-y-1">
                        {IP_SUBMENU.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => setActiveSubMenu(subItem.id)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-left transition-colors ${
                              activeSubMenu === subItem.id
                                ? 'bg-[#2E86DE] text-white'
                                : 'text-[#A0C4E8] hover:bg-[#0D3258] hover:text-white'
                            }`}
                          >
                            <span className="text-xs">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderPanel()}
          </div>
        </div>
      )}
    </div>
  );
}
