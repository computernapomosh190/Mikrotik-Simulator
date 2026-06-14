export const LEVEL_COLORS: Record<number, string> = {
  1: '#2E86DE',
  2: '#10AC84',
  3: '#F39C12',
  4: '#9B59B6',
  5: '#E74C3C',
  6: '#1ABC9C',
};

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Основи RouterOS',
  2: 'Routing',
  3: 'VLAN та Switching',
  4: 'VPN',
  5: 'Security',
  6: 'Enterprise',
};

export const DIFFICULTY_COLORS = {
  beginner: '#10AC84',
  intermediate: '#F39C12',
  advanced: '#E74C3C',
};

export const DIFFICULTY_LABELS = {
  beginner: 'Початківець',
  intermediate: 'Середній',
  advanced: 'Просунутий',
};

export const WINBOX_MENUS = [
  { id: 'interfaces', label: 'Interfaces', icon: 'Wifi' },
  { id: 'bridge', label: 'Bridge', icon: 'Box' },
  { id: 'vlan', label: 'VLAN', icon: 'Layers' },
  { id: 'ip', label: 'IP', icon: 'Globe' },
  { id: 'dhcp', label: 'DHCP', icon: 'Server' },
  { id: 'dns', label: 'DNS', icon: 'Search' },
  { id: 'firewall', label: 'Firewall', icon: 'Shield' },
  { id: 'routing', label: 'Routing', icon: 'Route' },
  { id: 'vpn', label: 'VPN', icon: 'Lock' },
  { id: 'queues', label: 'Queues', icon: 'BarChart' },
  { id: 'tools', label: 'Tools', icon: 'Wrench' },
  { id: 'files', label: 'Files', icon: 'Folder' },
  { id: 'system', label: 'System', icon: 'Settings' },
];
