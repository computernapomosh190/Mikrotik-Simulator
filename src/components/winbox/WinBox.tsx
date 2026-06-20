import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouterStore } from '../../store/routerStore';
import { FloatingWindow, type WindowConfig } from './FloatingWindow';

// Panels
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
import { QuickSetPanel } from './panels/QuickSetPanel';
import { WirelessPanel } from './panels/WirelessPanel';
import { PppPanel } from './panels/PppPanel';
import { QueuesPanel } from './panels/QueuesPanel';
import { LogPanel } from './panels/LogPanel';
import { FilesPanel } from './panels/FilesPanel';
import { ToolsPanel } from './panels/ToolsPanel';
import { IPv6Panel } from './panels/IPv6Panel';

import {
  Zap, Wifi, Radio, Network, Shield, Route, Settings,
  Server, Globe, Layers, Box, Lock, Terminal, FileText,
  List, Wrench, ChevronRight, RefreshCw, Search,
  Minus, Maximize2, X, MonitorDot,
} from 'lucide-react';

// ─── Sidebar menu definition ──────────────────────────────────────────────────

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string }[];
}

const MENU: MenuItem[] = [
  { id: 'quickset', label: 'Quick Set', icon: Zap },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  {
    id: 'wireless', label: 'Wireless', icon: Radio,
    children: [
      { id: 'wireless-interfaces', label: 'Interfaces' },
      { id: 'wireless-profiles', label: 'Security Profiles' },
      { id: 'wireless-access', label: 'Access List' },
      { id: 'wireless-connect', label: 'Connect List' },
      { id: 'wireless-registration', label: 'Registration Table' },
    ],
  },
  { id: 'interfaces', label: 'Interfaces', icon: Network },
  {
    id: 'wireguard', label: 'WireGuard', icon: Lock,
    children: [
      { id: 'vpn-wireguard', label: 'WireGuard' },
      { id: 'vpn-peers', label: 'Peers' },
    ],
  },
  {
    id: 'bridge', label: 'Bridge', icon: Box,
    children: [
      { id: 'bridge-main', label: 'Bridge' },
      { id: 'bridge-ports', label: 'Ports' },
      { id: 'bridge-vlans', label: 'VLANs' },
      { id: 'bridge-mdb', label: 'MDB' },
      { id: 'bridge-filters', label: 'Filters' },
      { id: 'bridge-hosts', label: 'Hosts' },
    ],
  },
  {
    id: 'ppp', label: 'PPP', icon: Server,
    children: [
      { id: 'ppp-main', label: 'Interface' },
      { id: 'ppp-pppoe', label: 'PPPoE Servers' },
      { id: 'ppp-secrets', label: 'Secrets' },
      { id: 'ppp-profiles', label: 'Profiles' },
      { id: 'ppp-aaa', label: 'AAA' },
    ],
  },
  {
    id: 'ip', label: 'IP', icon: Globe,
    children: [
      { id: 'ip-address', label: 'Addresses' },
      { id: 'ip-arp', label: 'ARP' },
      { id: 'ip-dns', label: 'DNS' },
      { id: 'ip-dhcp-client', label: 'DHCP Client' },
      { id: 'ip-dhcp-server', label: 'DHCP Server' },
      { id: 'ip-firewall', label: 'Firewall' },
      { id: 'ip-hotspot', label: 'Hotspot' },
      { id: 'ip-pool', label: 'Pool' },
      { id: 'ip-routes', label: 'Routes' },
      { id: 'ip-service', label: 'Services' },
      { id: 'ip-cloud', label: 'Cloud' },
    ],
  },
  {
    id: 'ipv6', label: 'IPv6', icon: Globe,
    children: [
      { id: 'ipv6-addresses', label: 'Addresses' },
      { id: 'ipv6-routes', label: 'Routes' },
      { id: 'ipv6-neighbors', label: 'Neighbors' },
      { id: 'ipv6-nd', label: 'ND' },
      { id: 'ipv6-settings', label: 'Settings' },
    ],
  },
  {
    id: 'mpls', label: 'MPLS', icon: Layers,
    children: [
      { id: 'mpls-ldp', label: 'LDP' },
      { id: 'mpls-traffic-eng', label: 'Traffic Eng.' },
    ],
  },
  {
    id: 'routing', label: 'Routing', icon: Route,
    children: [
      { id: 'routing-static', label: 'Static Routes' },
      { id: 'routing-ospf', label: 'OSPF' },
      { id: 'routing-bgp', label: 'BGP' },
      { id: 'routing-rip', label: 'RIP' },
      { id: 'routing-filters', label: 'Filters' },
    ],
  },
  {
    id: 'system', label: 'System', icon: Settings,
    children: [
      { id: 'system-main', label: 'Identity & Resources' },
      { id: 'system-users', label: 'Users' },
      { id: 'system-passwords', label: 'Password' },
      { id: 'system-packages', label: 'Packages' },
      { id: 'system-ntp', label: 'NTP Client' },
      { id: 'system-scheduler', label: 'Scheduler' },
      { id: 'system-scripts', label: 'Scripts' },
      { id: 'system-snmp', label: 'SNMP' },
      { id: 'system-watchdog', label: 'Watchdog' },
      { id: 'system-routerboard', label: 'RouterBOARD' },
      { id: 'system-certificates', label: 'Certificates' },
      { id: 'system-reboot', label: 'Reboot' },
    ],
  },
  { id: 'queues', label: 'Queues', icon: List },
  { id: 'dot1x', label: 'Dot1X', icon: Shield },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'log', label: 'Log', icon: MonitorDot },
  { id: 'terminal', label: 'New Terminal', icon: Terminal },
  {
    id: 'tools', label: 'Tools', icon: Wrench,
    children: [
      { id: 'tools-ping', label: 'Ping' },
      { id: 'tools-traceroute', label: 'Traceroute' },
      { id: 'tools-bandwidth', label: 'Bandwidth Test' },
      { id: 'tools-netwatch', label: 'Netwatch' },
      { id: 'tools-ipscan', label: 'IP Scan' },
      { id: 'tools-graphing', label: 'Graphing' },
    ],
  },
];

// ─── Panel renderer ───────────────────────────────────────────────────────────

function renderPanel(panelType: string, onOpenTerminal: () => void): React.ReactNode {
  if (panelType === 'interfaces') return <InterfacesPanel />;
  if (panelType === 'ip-address') return <IpAddressPanel />;
  if (panelType === 'ip-dns') return <DnsPanel />;
  if (panelType === 'ip-dhcp-server') return <DhcpPanel />;
  if (panelType === 'ip-dhcp-client') return <DhcpPanel />;
  if (panelType === 'ip-firewall') return <FirewallPanel />;
  if (panelType === 'ip-routes' || panelType === 'routing-static') return <RoutingPanel />;
  if (panelType === 'bridge-main' || panelType === 'bridge-ports') return <BridgePanel />;
  if (panelType === 'bridge-vlans') return <VlanPanel />;
  if (panelType === 'vpn-wireguard' || panelType === 'vpn-peers') return <VpnPanel />;
  if (panelType === 'system-main') return <SystemPanel />;
  if (panelType === 'quickset') return <QuickSetPanel />;
  if (panelType.startsWith('wireless')) return <WirelessPanel />;
  if (panelType.startsWith('ppp')) return <PppPanel />;
  if (panelType === 'queues') return <QueuesPanel />;
  if (panelType === 'log') return <LogPanel />;
  if (panelType === 'files') return <FilesPanel />;
  if (panelType === 'tools-ping') return <ToolsPanel tool="ping" />;
  if (panelType === 'tools-traceroute') return <ToolsPanel tool="traceroute" />;
  if (panelType === 'tools-bandwidth') return <ToolsPanel tool="bandwidth" />;
  if (panelType.startsWith('ipv6')) return <IPv6Panel />;
  if (panelType === 'terminal') {
    onOpenTerminal();
    return null;
  }
  // Generic placeholder
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-[#4A90D9] text-xs opacity-60">
      <Settings className="w-8 h-8" />
      <span className="capitalize">{panelType.replace(/-/g, ' ')}</span>
    </div>
  );
}

function getWindowTitle(id: string): { title: string; width: number; height: number } {
  const map: Record<string, { title: string; width: number; height: number }> = {
    quickset: { title: 'Quick Set', width: 620, height: 440 },
    interfaces: { title: 'Interfaces', width: 640, height: 380 },
    'wireless-interfaces': { title: 'Wireless', width: 680, height: 400 },
    'ip-address': { title: 'IP Addresses', width: 560, height: 360 },
    'ip-dns': { title: 'DNS', width: 500, height: 380 },
    'ip-dhcp-server': { title: 'DHCP Server', width: 580, height: 400 },
    'ip-dhcp-client': { title: 'DHCP Client', width: 540, height: 360 },
    'ip-firewall': { title: 'Firewall', width: 760, height: 460 },
    'ip-routes': { title: 'Routes', width: 620, height: 380 },
    'routing-static': { title: 'Static Routes', width: 620, height: 380 },
    'bridge-main': { title: 'Bridge', width: 600, height: 380 },
    'bridge-vlans': { title: 'Bridge VLANs', width: 560, height: 360 },
    'vpn-wireguard': { title: 'WireGuard', width: 580, height: 400 },
    'system-main': { title: 'System', width: 540, height: 440 },
    'ppp-main': { title: 'PPP', width: 640, height: 400 },
    queues: { title: 'Queues', width: 620, height: 400 },
    log: { title: 'Log', width: 680, height: 420 },
    files: { title: 'File List', width: 620, height: 380 },
    'tools-ping': { title: 'Ping', width: 560, height: 420 },
    'tools-traceroute': { title: 'Traceroute', width: 540, height: 360 },
    'tools-bandwidth': { title: 'Bandwidth Test', width: 520, height: 380 },
    'ipv6-addresses': { title: 'IPv6 Addresses', width: 560, height: 380 },
  };
  return map[id] || { title: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), width: 560, height: 380 };
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function WinBoxLoginScreen({ onConnect }: { onConnect: () => void }) {
  const interfaces = useRouterStore((s) => s.interfaces);
  const [connectTo, setConnectTo] = useState(interfaces[0]?.macAddress || '00:11:22:33:44:01');
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const neighbors = [
    { mac: interfaces[0]?.macAddress || '00:11:22:33:44:01', ip: '', identity: 'MikroTik', version: '7.15', board: 'RB760iGS' },
  ];

  const handleConnect = async () => {
    if (login !== 'admin') { setError('Invalid login'); return; }
    setConnecting(true);
    setError('');
    await new Promise((r) => setTimeout(r, 700));
    setConnecting(false);
    onConnect();
  };

  return (
    <div className="h-full flex bg-[#E4E8ED] font-sans text-sm select-none">
      <div className="w-[320px] bg-[#F0F2F5] border-r border-[#C8CDD3] flex flex-col">
        <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-[#1A1F2E] to-[#1E2B3C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#CC2936] font-black text-lg">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">mikrotik</span>
          </div>
          <p className="text-[#4A90D9] text-xs mt-2">WinBox v4.1</p>
        </div>
        <div className="flex-1 p-5 space-y-3">
          {[
            { label: 'Connect to', val: connectTo, set: setConnectTo, type: 'text' },
            { label: 'Login', val: login, set: setLogin, type: 'text' },
            { label: 'Password', val: password, set: setPassword, type: 'password' },
          ].map(({ label, val, set, type }) => (
            <div key={label}>
              <label className="block text-[#555] text-xs mb-1">{label}</label>
              <input
                type={type}
                value={val}
                onChange={(e) => set(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                className="w-full px-2 py-1.5 bg-white border border-[#B0B8C4] rounded text-[#222] text-xs focus:outline-none focus:border-[#4A90D9]"
              />
            </div>
          ))}
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <p className="text-[#999] text-xs">Default: admin / (empty password)</p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex-1 py-1.5 bg-[#1B6EBE] hover:bg-[#1557A0] text-white rounded text-xs font-medium disabled:opacity-60 transition-colors"
            >
              {connecting ? 'Connecting...' : 'Connect'}
            </button>
            <button
              onClick={() => { setConnectTo(''); setPassword(''); setError(''); }}
              className="px-3 py-1.5 bg-[#D8DDE4] hover:bg-[#C8CDD3] text-[#444] rounded text-xs transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2 text-[#666] text-xs">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember password</label>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#E0E4EA] border-b border-[#C8CDD3]">
          <span className="text-[#555] text-xs font-medium">Select from:</span>
          <select className="px-2 py-0.5 bg-white border border-[#B0B8C4] rounded text-xs text-[#333] outline-none">
            <option>Neighbors</option>
          </select>
          <div className="flex-1" />
          <button className="flex items-center gap-1 px-2 py-0.5 bg-white border border-[#B0B8C4] rounded text-xs text-[#333] hover:bg-[#F0F2F5]">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#D8DCE3] border-b border-[#C0C6CE]">
                <th className="text-left px-3 py-1.5 font-medium text-[#444] w-8"><input type="checkbox" /></th>
                <th className="text-left px-3 py-1.5 font-medium text-[#444]">MAC Address</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#444]">IP Address</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#444]">Identity</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#444]">Version</th>
                <th className="text-left px-3 py-1.5 font-medium text-[#444]">Board</th>
              </tr>
            </thead>
            <tbody>
              {neighbors.map((n) => (
                <tr
                  key={n.mac}
                  onClick={() => setConnectTo(n.mac)}
                  onDoubleClick={handleConnect}
                  className={`border-b border-[#E0E4EA] cursor-pointer ${connectTo === n.mac ? 'bg-[#B8D4F0]' : 'bg-white hover:bg-[#D0E4F8]'}`}
                >
                  <td className="px-3 py-1.5"><input type="checkbox" checked={connectTo === n.mac} readOnly /></td>
                  <td className="px-3 py-1.5 text-[#0055CC] font-mono">{n.mac}</td>
                  <td className="px-3 py-1.5 text-[#555]">{n.ip || '-'}</td>
                  <td className="px-3 py-1.5 font-medium">{n.identity}</td>
                  <td className="px-3 py-1.5 text-[#555]">{n.version}</td>
                  <td className="px-3 py-1.5 text-[#555]">{n.board}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-[#888] text-xs italic">Double-click a row or select and click Connect</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main WinBox desktop ──────────────────────────────────────────────────────

interface WinBoxProps {
  onOpenTerminal: () => void;
}

export function WinBox({ onOpenTerminal }: WinBoxProps) {
  const winboxConnected = useRouterStore((s) => s.winboxConnected);
  const setWinboxConnected = useRouterStore((s) => s.setWinboxConnected);
  const hostname = useRouterStore((s) => s.hostname);

  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [nextZ, setNextZ] = useState(10);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const desktopRef = useRef<HTMLDivElement>(null);

  const bringToFront = useCallback((id: string) => {
    setNextZ((z) => z + 1);
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, zIndex: nextZ + 1 } : w)));
  }, [nextZ]);

  const openWindow = useCallback((panelType: string) => {
    if (panelType === 'terminal') {
      onOpenTerminal();
      return;
    }
    // Focus existing window
    const existing = windows.find((w) => w.panelType === panelType);
    if (existing) {
      setWindows((ws) => ws.map((w) => w.id === existing.id ? { ...w, minimized: false, zIndex: nextZ + 1 } : w));
      setNextZ((z) => z + 1);
      return;
    }
    const meta = getWindowTitle(panelType);
    const offset = (windows.length % 8) * 24;
    const rect = desktopRef.current?.getBoundingClientRect();
    const maxX = rect ? rect.width - meta.width - 20 : 200;
    const maxY = rect ? rect.height - meta.height - 20 : 100;
    const newWin: WindowConfig = {
      id: `${panelType}-${Date.now()}`,
      title: meta.title,
      panelType,
      x: Math.max(8, Math.min(maxX, 40 + offset)),
      y: Math.max(8, Math.min(maxY, 20 + offset)),
      width: meta.width,
      height: meta.height,
      minimized: false,
      zIndex: nextZ + 1,
    };
    setNextZ((z) => z + 1);
    setWindows((ws) => [...ws, newWin]);
  }, [windows, nextZ, onOpenTerminal]);

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => w.id === id ? { ...w, minimized: !w.minimized } : w));
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => w.id === id ? { ...w, x, y } : w));
  }, []);

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows((ws) => ws.map((w) => w.id === id ? { ...w, width, height } : w));
  }, []);

  const toggleMenu = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  };

  const filteredMenu = search
    ? MENU.flatMap((m) => {
        const children = m.children?.filter((c) => c.label.toLowerCase().includes(search.toLowerCase())) || [];
        if (m.label.toLowerCase().includes(search.toLowerCase())) return [m];
        if (children.length > 0) return [{ ...m, children }];
        return [];
      })
    : MENU;

  // Keyboard: Escape closes search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearch(''); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!winboxConnected) {
    return (
      <div className="h-full overflow-hidden rounded-lg border border-[#2A3F55]">
        <WinBoxLoginScreen onConnect={() => setWinboxConnected(true)} />
      </div>
    );
  }

  const minimizedWindows = windows.filter((w) => w.minimized);

  return (
    <div className="h-full flex flex-col bg-[#0D1825] rounded-lg overflow-hidden border border-[#2A3F55]">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-[#1A2535] border-b border-[#2A3F55] shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center shrink-0">
            <span className="text-[#CC2936] font-black text-xs">M</span>
          </div>
          <span className="text-white font-semibold text-xs hidden sm:block">mikrotik</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#8BA3BF]">
          <span>Workspace:</span>
          <select className="bg-[#0D1825] border border-[#2A3F55] rounded px-1.5 py-0.5 text-[#C8D6E5] text-xs outline-none">
            <option>&lt;own&gt;</option>
          </select>
        </div>
        <div className="flex items-center gap-1 flex-1 max-w-[180px]">
          <Search className="w-3 h-3 text-[#4A90D9] shrink-0" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0D1825] border border-[#2A3F55] rounded px-2 py-0.5 text-[#C8D6E5] text-xs outline-none focus:border-[#4A90D9] w-full"
          />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => openWindow('quickset')}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#1B6EBE] hover:bg-[#1557A0] text-white rounded text-xs transition-colors"
        >
          + New WinBox
        </button>
        <span className="text-[#4A90D9] text-xs font-mono hidden md:block">{hostname}</span>
        <div className="flex items-center gap-1 text-xs text-[#8BA3BF]">
          <span>Safe Mode</span>
          <div className="w-5 h-3 bg-[#0D1825] border border-[#2A3F55] rounded-full" />
        </div>
        <button
          onClick={() => setWinboxConnected(false)}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#1A2535] border border-[#2A3F55] hover:bg-red-800 text-[#8BA3BF] hover:text-white rounded text-xs transition-colors"
          title="Disconnect"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <div className="w-44 bg-[#111D2B] border-r border-[#1E3448] flex flex-col shrink-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto py-1 text-xs">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isExpanded = expanded[item.id] || !!search;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        toggleMenu(item.id);
                      } else {
                        openWindow(item.id);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-[#1A2B3C] text-[#A8BCD0] hover:text-white"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-[#4A90D9]" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.children && (
                      <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </button>
                  {item.children && isExpanded && (
                    <div className="bg-[#0D1825]">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => openWindow(child.id)}
                          className="w-full flex items-center gap-2 pl-7 pr-3 py-1 text-left text-[#8BA3BF] hover:bg-[#1A2B3C] hover:text-white transition-colors"
                        >
                          <span className="truncate">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Desktop / windows area ── */}
        <div className="flex-1 relative overflow-hidden" ref={desktopRef}>
          {/* Subtle grid background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #1E3448 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              opacity: 0.3,
            }}
          />

          {/* Empty state hint */}
          {windows.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-[#1A2B3C] flex items-center justify-center">
                <Network className="w-6 h-6 text-[#4A90D9] opacity-50" />
              </div>
              <p className="text-[#4A90D9] text-xs opacity-40">Click a menu item to open a window</p>
            </div>
          )}

          {/* Floating windows */}
          {windows.map((win) => (
            <FloatingWindow
              key={win.id}
              config={win}
              onFocus={() => bringToFront(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMove={(x, y) => moveWindow(win.id, x, y)}
              onResize={(w, h) => resizeWindow(win.id, w, h)}
            >
              {renderPanel(win.panelType, onOpenTerminal)}
            </FloatingWindow>
          ))}
        </div>
      </div>

      {/* ── Taskbar (minimized windows) ── */}
      {minimizedWindows.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-[#111D2B] border-t border-[#1E3448] overflow-x-auto shrink-0">
          {minimizedWindows.map((w) => (
            <button
              key={w.id}
              onClick={() => minimizeWindow(w.id)}
              className="flex items-center gap-1.5 px-2 py-1 bg-[#1A2B3C] border border-[#2A3F55] hover:bg-[#243549] rounded text-[#C8D6E5] text-xs transition-colors whitespace-nowrap"
            >
              <Maximize2 className="w-3 h-3 text-[#4A90D9]" />
              {w.title}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-[#4A90D9] text-xs opacity-50">{minimizedWindows.length} minimized</span>
        </div>
      )}
    </div>
  );
}
