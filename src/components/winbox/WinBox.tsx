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

export function WinBox({ onOpenTerminal }: WinBoxProps) {
  const [activeMenu, setActiveMenu] = useState('interfaces');
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const hostname = useRouterStore((s) => s.hostname);

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
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#183557] to-[#0B2942] border-b border-[#1B4973]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">MT</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{hostname}</p>
            <p className="text-[#4A90D9] text-xs">RouterOS v7.15</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTerminal}
            className="p-2 hover:bg-[#0D3258] rounded transition-colors text-[#4A90D9] hover:text-white"
            title="Open Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-1 hover:bg-[#0D3258] rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-[#4A90D9]" />
          </button>
          <button className="p-1 hover:bg-[#0D3258] rounded transition-colors">
            <Maximize2 className="w-4 h-4 text-[#4A90D9]" />
          </button>
          <button className="p-1 hover:bg-red-500/20 rounded transition-colors">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-[#082035] border-r border-[#1B4973] overflow-y-auto">
          <div className="p-2 space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id || (item.hasSubmenu && activeSubMenu);
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
    </div>
  );
}
