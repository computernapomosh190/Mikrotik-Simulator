import { create } from 'zustand';

interface RouterState {
  hostname: string;
  interfaces: RouterInterface[];
  ipAddresses: IpAddress[];
  bridges: Bridge[];
  vlans: Vlan[];
  dhcpServers: DhcpServer[];
  firewallRules: FirewallRule[];
  routes: Route[];
  wireGuardPeers: WireGuardPeer[];
  dnsClients: DnsClient[];
  dnsStatic: DnsStatic[];
  addressLists: AddressList[];
  cliHistory: CliEntry[];
}

interface RouterInterface {
  id: string;
  name: string;
  type: string;
  mtu: number;
  enabled: boolean;
  macAddress: string;
  lastLinkUpTime?: string;
}

interface IpAddress {
  id: string;
  address: string;
  network: string;
  interface: string;
  disabled: boolean;
}

interface Bridge {
  id: string;
  name: string;
  ports: { interface: string; pvid?: number; tagged?: number[] }[];
  vlanFiltering: boolean;
  protocolMode: string;
}

interface Vlan {
  id: string;
  interface: string;
  name: string;
  vlanId: number;
  mtu: number;
}

interface DhcpServer {
  id: string;
  name: string;
  interface: string;
  addressPool: string;
  leaseTime: string;
  gateway: string;
  dnsServer: string;
  disabled: boolean;
}

interface FirewallRule {
  id: string;
  chain: string;
  action: string;
  protocol?: string;
  srcAddress?: string;
  dstAddress?: string;
  srcPort?: string;
  dstPort?: string;
  connectionState?: string;
  inInterface?: string;
  outInterface?: string;
  comment?: string;
  disabled: boolean;
}

interface Route {
  id: string;
  dstAddress: string;
  gateway: string;
  distance: number;
  checkGateway?: string;
  scope: number;
  active: boolean;
}

interface WireGuardPeer {
  id: string;
  name: string;
  publicKey: string;
  endpoint?: string;
  allowedAddress: string;
  persistentKeepalive: number;
  listenPort: number;
  privateKey: string;
}

interface DnsClient {
  id: string;
  servers: string;
  allowRemoteRequests: boolean;
  cacheSize: number;
}

interface DnsStatic {
  id: string;
  name: string;
  address: string;
  ttl: string;
}

interface AddressList {
  id: string;
  name: string;
  list: string;
  address: string;
  timeout?: string;
}

interface CliEntry {
  timestamp: Date;
  command: string;
  output: string;
  success: boolean;
}

interface RouterActions {
  setHostname: (hostname: string) => void;
  addIpAddress: (address: Omit<IpAddress, 'id'>) => void;
  removeIpAddress: (id: string) => void;
  toggleInterface: (id: string) => void;
  addBridge: (bridge: Omit<Bridge, 'id'>) => void;
  removeBridge: (id: string) => void;
  addVlan: (vlan: Omit<Vlan, 'id'>) => void;
  removeVlan: (id: string) => void;
  addDhcpServer: (server: Omit<DhcpServer, 'id'>) => void;
  updateDhcpServer: (id: string, updates: Partial<DhcpServer>) => void;
  removeDhcpServer: (id: string) => void;
  addFirewallRule: (rule: Omit<FirewallRule, 'id'>) => void;
  updateFirewallRule: (id: string, updates: Partial<FirewallRule>) => void;
  removeFirewallRule: (id: string) => void;
  addRoute: (route: Omit<Route, 'id'>) => void;
  removeRoute: (id: string) => void;
  addWireGuardPeer: (peer: Omit<WireGuardPeer, 'id'>) => void;
  removeWireGuardPeer: (id: string) => void;
  addDnsStatic: (entry: Omit<DnsStatic, 'id'>) => void;
  removeDnsStatic: (id: string) => void;
  addAddressList: (entry: Omit<AddressList, 'id'>) => void;
  removeAddressList: (id: string) => void;
  addCliEntry: (entry: Omit<CliEntry, 'timestamp'>) => void;
  reset: () => void;
}

const defaultInterfaces: RouterInterface[] = [
  { id: '1', name: 'ether1', type: 'ether', mtu: 1500, enabled: true, macAddress: '00:11:22:33:44:01' },
  { id: '2', name: 'ether2', type: 'ether', mtu: 1500, enabled: true, macAddress: '00:11:22:33:44:02' },
  { id: '3', name: 'ether3', type: 'ether', mtu: 1500, enabled: true, macAddress: '00:11:22:33:44:03' },
  { id: '4', name: 'ether4', type: 'ether', mtu: 1500, enabled: false, macAddress: '00:11:22:33:44:04' },
  { id: '5', name: 'ether5', type: 'ether', mtu: 1500, enabled: false, macAddress: '00:11:22:33:44:05' },
];

const initialState: RouterState = {
  hostname: 'MikroTik',
  interfaces: defaultInterfaces,
  ipAddresses: [],
  bridges: [],
  vlans: [],
  dhcpServers: [],
  firewallRules: [],
  routes: [],
  wireGuardPeers: [],
  dnsClients: [{ id: '1', servers: '8.8.8.8', allowRemoteRequests: false, cacheSize: 2048 }],
  dnsStatic: [],
  addressLists: [],
  cliHistory: [],
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateRouterOSCommand = (action: string, entity: string, params: Record<string, unknown>): string => {
  const paramStr = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => {
      if (typeof v === 'string' && v.includes(' ')) {
        return `${k}="${v}"`;
      }
      return `${k}=${v}`;
    })
    .join(' ');

  const path = entity.replace(/_/g, ' ');
  return `${action} ${path}${paramStr ? ' ' + paramStr : ''}`;
};

export const useRouterStore = create<RouterState & RouterActions>((set, get) => ({
  ...initialState,

  setHostname: (hostname) => {
    const cmd = generateRouterOSCommand('set', 'system identity', { name: hostname });
    set((state) => ({
      hostname,
      cliHistory: [...state.cliHistory, { timestamp: new Date(), command: cmd, output: '', success: true }],
    }));
  },

  addIpAddress: (address) => {
    const id = generateId();
    const cmd = generateRouterOSCommand('add', 'ip address', {
      address: address.address,
      interface: address.interface,
      disabled: address.disabled ? 'yes' : undefined,
    });
    set((state) => ({
      ipAddresses: [...state.ipAddresses, { ...address, id }],
      cliHistory: [...state.cliHistory, { timestamp: new Date(), command: cmd, output: '', success: true }],
    }));
  },

  removeIpAddress: (id) => {
    const address = get().ipAddresses.find(a => a.id === id);
    if (address) {
      const cmd = generateRouterOSCommand('remove', 'ip address', { '.id': address.id });
      set((state) => ({
        ipAddresses: state.ipAddresses.filter(a => a.id !== id),
        cliHistory: [...state.cliHistory, { timestamp: new Date(), command: cmd, output: '', success: true }],
      }));
    }
  },

  toggleInterface: (id) => {
    set((state) => ({
      interfaces: state.interfaces.map(i =>
        i.id === id ? { ...i, enabled: !i.enabled } : i
      ),
    }));
  },

  addBridge: (bridge) => {
    const id = generateId();
    set((state) => ({
      bridges: [...state.bridges, { ...bridge, id }],
    }));
  },

  removeBridge: (id) => {
    set((state) => ({
      bridges: state.bridges.filter(b => b.id !== id),
    }));
  },

  addVlan: (vlan) => {
    const id = generateId();
    set((state) => ({
      vlans: [...state.vlans, { ...vlan, id }],
    }));
  },

  removeVlan: (id) => {
    set((state) => ({
      vlans: state.vlans.filter(v => v.id !== id),
    }));
  },

  addDhcpServer: (server) => {
    const id = generateId();
    set((state) => ({
      dhcpServers: [...state.dhcpServers, { ...server, id }],
    }));
  },

  updateDhcpServer: (id, updates) => {
    set((state) => ({
      dhcpServers: state.dhcpServers.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  },

  removeDhcpServer: (id) => {
    set((state) => ({
      dhcpServers: state.dhcpServers.filter(s => s.id !== id),
    }));
  },

  addFirewallRule: (rule) => {
    const id = generateId();
    set((state) => ({
      firewallRules: [...state.firewallRules, { ...rule, id }],
    }));
  },

  updateFirewallRule: (id, updates) => {
    set((state) => ({
      firewallRules: state.firewallRules.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  },

  removeFirewallRule: (id) => {
    set((state) => ({
      firewallRules: state.firewallRules.filter(r => r.id !== id),
    }));
  },

  addRoute: (route) => {
    const id = generateId();
    set((state) => ({
      routes: [...state.routes, { ...route, id }],
    }));
  },

  removeRoute: (id) => {
    set((state) => ({
      routes: state.routes.filter(r => r.id !== id),
    }));
  },

  addWireGuardPeer: (peer) => {
    const id = generateId();
    set((state) => ({
      wireGuardPeers: [...state.wireGuardPeers, { ...peer, id }],
    }));
  },

  removeWireGuardPeer: (id) => {
    set((state) => ({
      wireGuardPeers: state.wireGuardPeers.filter(p => p.id !== id),
    }));
  },

  addDnsStatic: (entry) => {
    const id = generateId();
    set((state) => ({
      dnsStatic: [...state.dnsStatic, { ...entry, id }],
    }));
  },

  removeDnsStatic: (id) => {
    set((state) => ({
      dnsStatic: state.dnsStatic.filter(e => e.id !== id),
    }));
  },

  addAddressList: (entry) => {
    const id = generateId();
    set((state) => ({
      addressLists: [...state.addressLists, { ...entry, id }],
    }));
  },

  removeAddressList: (id) => {
    set((state) => ({
      addressLists: state.addressLists.filter(e => e.id !== id),
    }));
  },

  addCliEntry: (entry) => {
    set((state) => ({
      cliHistory: [...state.cliHistory, { ...entry, timestamp: new Date() }],
    }));
  },

  reset: () => {
    set(initialState);
  },
}));
