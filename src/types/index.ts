export type UserRole = 'student' | 'instructor' | 'administrator';

export type LabStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  rating: number;
  totalLabsCompleted: number;
  currentLevel: number;
  currentCourseId: string | null;
  createdAt: string;
}

export interface Course {
  id: string;
  level: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  orderIndex: number;
  labsCount?: number;
  completedLabsCount?: number;
  progress?: number;
}

export interface LabTask {
  title: string;
  description: string;
  completed?: boolean;
}

export interface Lab {
  id: string;
  courseId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  objectives: string[];
  tasks: LabTask[];
  networkTopology: NetworkTopology;
  validationRules: ValidationRule[];
  points: number;
  orderIndex: number;
  isActive: boolean;
  status?: LabStatus;
  score?: number;
  attempts?: number;
}

export interface NetworkTopology {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
}

export interface NetworkDevice {
  id: string;
  type: 'router' | 'switch' | 'pc' | 'server' | 'cloud';
  name: string;
  x: number;
  y: number;
  config?: DeviceConfig;
}

export interface DeviceConfig {
  interfaces?: RouterInterface[];
  bridges?: BridgeConfig[];
  vlans?: VlanConfig[];
  ipAddresses?: IpAddressConfig[];
  dhcpServers?: DhcpServerConfig[];
  firewallRules?: FirewallRule[];
  routes?: RouteConfig[];
  wireGuard?: WireGuardConfig[];
}

export interface RouterInterface {
  name: string;
  type: string;
  enabled: boolean;
  macAddress?: string;
  mtu?: number;
}

export interface BridgeConfig {
  name: string;
  ports: string[];
  vlanFiltering: boolean;
}

export interface VlanConfig {
  interface: string;
  vlanId: number;
  name: string;
}

export interface IpAddressConfig {
  address: string;
  interface: string;
  disabled: boolean;
}

export interface DhcpServerConfig {
  name: string;
  interface: string;
  addressPool: string;
  gateway: string;
  dnsServer: string;
  leaseTime: string;
  disabled: boolean;
}

export interface FirewallRule {
  chain: string;
  action: string;
  protocol?: string;
  srcAddress?: string;
  dstAddress?: string;
  srcPort?: string;
  dstPort?: string;
  connectionState?: string;
  comment?: string;
  disabled: boolean;
}

export interface RouteConfig {
  dstAddress: string;
  gateway: string;
  distance: number;
  checkGateway?: string;
}

export interface WireGuardConfig {
  name: string;
  privateKey: string;
  publicKey: string;
  listenPort?: number;
  peers: WireGuardPeer[];
}

export interface WireGuardPeer {
  publicKey: string;
  endpoint?: string;
  allowedAddress: string;
}

export interface NetworkConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceInterface?: string;
  targetInterface?: string;
}

export interface ValidationRule {
  type: string;
  target: string;
  expected: string;
  description: string;
}

export interface UserProgress {
  id: string;
  labId: string;
  status: LabStatus;
  score: number;
  attempts: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface LabConfiguration {
  id: string;
  labId: string;
  configuration: DeviceConfig[];
  cliHistory: CliCommand[];
}

export interface CliCommand {
  timestamp: string;
  command: string;
  output: string;
  success: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
  points: number;
  earnedAt?: string;
}

export interface AchievementCriteria {
  type: string;
  count?: number;
  level?: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle?: string;
  courseLevel?: number;
  certificateNumber: string;
  issuedAt: string;
  verificationCode: string;
  digitalSignature: string;
  pdfUrl: string | null;
  pngUrl: string | null;
}

export interface ExamResult {
  id: string;
  courseId: string;
  score: number;
  passed: boolean;
  takenAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  points: number;
  labsCompleted: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  rank?: number;
}
