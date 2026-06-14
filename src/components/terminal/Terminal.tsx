import { useState, useRef, useEffect } from 'react';
import { useRouterStore } from '../../store/routerStore';
import { X, Minimize2, Maximize2, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROMPT = '[admin@MikroTik] > ';

const COMMAND_CATEGORIES: Record<string, string[]> = {
  'interface': ['print', 'enable', 'disable', 'set'],
  'ip': ['address', 'route', 'dns', 'dhcp-client', 'dhcp-server'],
  'bridge': ['add', 'remove', 'print', 'port'],
  'interface vlan': ['add', 'remove', 'print', 'set'],
  'ip firewall': ['filter', 'nat', 'mangle', 'address-list'],
  'ip route': ['add', 'remove', 'print', 'set'],
  'system': ['identity', 'reboot', 'shutdown', 'resource'],
  'ping': [],
  'tool': ['ping', 'traceroute', 'bandwidth-test'],
};

function generateOutput(command: string, routerState: ReturnType<typeof useRouterStore.getState>): string {
  const cmd = command.toLowerCase().trim();
  const parts = cmd.split(/\s+/);
  const action = parts[parts.length - 1];
  const path = parts.slice(0, -1).join(' ');

  if (cmd === 'interface print' || cmd === '/interface print' || cmd === 'int pri') {
    let output = 'Flags: D - dynamic, X - disabled, R - running, S - slave\n';
    output += ' #    NAME       TYPE    MTU   MAC-ADDRESS\n';
    routerState.interfaces.forEach((iface, i) => {
      const flags = iface.enabled ? 'R' : 'X';
      output += ` ${flags} ${String(i + 1).padStart(2)}   ${iface.name.padEnd(10)} ${iface.type.padEnd(7)} ${String(iface.mtu).padEnd(5)} ${iface.macAddress}\n`;
    });
    return output;
  }

  if (cmd === 'ip address print' || cmd === '/ip address print' || cmd === 'ip addr pri') {
    if (routerState.ipAddresses.length === 0) {
      return 'No IP addresses configured';
    }
    let output = 'Flags: X - disabled, I - invalid, D - dynamic\n';
    output += ' #   ADDRESS           NETWORK         INTERFACE\n';
    routerState.ipAddresses.forEach((ip, i) => {
      const flag = ip.disabled ? 'X' : ' ';
      output += `${flag}${String(i + 1).padStart(2)}   ${ip.address.padEnd(17)} ${(ip.network || ip.address.split('/')[0] + '/24').padEnd(15)} ${ip.interface}\n`;
    });
    return output;
  }

  if (cmd === 'ip route print' || cmd === '/ip route print') {
    if (routerState.routes.length === 0) {
      return 'Flags: X - disabled, A - active, D - dynamic, C - connect, S - static, r - rip, b - bgp, o - ospf, m - mme, B - blackhole, U - unreachable, P - prohibit\n';
    }
    let output = 'Flags: X - disabled, A - active, D - dynamic, C - connect, S - static\n';
    output += ' #    DST-ADDRESS    GATEWAY    DISTANCE\n';
    routerState.routes.forEach((route, i) => {
      output += ` A ${String(i + 1).padStart(2)}   ${route.dstAddress.padEnd(14)} ${route.gateway.padEnd(10)} ${route.distance}\n`;
    });
    return output;
  }

  if (cmd === 'system resource print' || cmd === '/system resource print') {
    return `               uptime: 3d14h22m
              version: 7.15 (stable)
           build-time: Jun/14/2026
          free-memory: 985MiB
         total-memory: 2GiB
                 cpu: Intel(R) Xeon(R)
           cpu-count: 2
           cpu-frequency: 2.4GHz
           cpu-load: 15%
             free-hdd-space: 852MiB
            total-hdd-space: 1GiB
  write-sect-since-reboot: 1024
         architecture-name: x86
`;
  }

  if (cmd.startsWith('ping ')) {
    const host = parts[1];
    let output = '';
    for (let i = 0; i < 4; i++) {
      const time = Math.floor(Math.random() * 10) + 1;
      output += `  SEQ HOST     SIZE TTL TIME  STATUS\n  ${i + 1}   ${host.padEnd(8)} 64   64  ${time}ms  echo reply\n`;
    }
    output += '    sent=4 received=4 packet-loss=0% avg-rtt=5ms';
    return output;
  }

  if (cmd === 'quit' || cmd === 'exit') {
    return 'Goodbye!';
  }

  if (cmd === '?' || cmd === 'help') {
    return `Available commands:
  interface        - Network interfaces
  ip               - IP configuration (addresses, routes, dns, dhcp)
  bridge           - Bridge configuration
  system           - System settings
  ping             - Ping utility
  tool             - Network tools
  export           - Export configuration
  ?                - Show this help
`;
  }

  if (action === 'print' || action === 'pri') {
    if (path.includes('firewall')) {
      if (routerState.firewallRules.length === 0) {
        return 'No firewall rules configured';
      }
      return 'Flags: X - disabled, I - invalid, D - dynamic\nChain: input, output, forward\nRules configured: ' + routerState.firewallRules.length;
    }
    return `  echo: ${command}`;
  }

  return `  echo: ${command}`;
}

export function Terminal({ isOpen, onClose }: TerminalProps) {
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [maximized, setMaximized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routerState = useRouterStore();
  const hostname = useRouterStore((s) => s.hostname);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const output = generateOutput(currentCommand, routerState);
    setHistory(prev => [...prev, { command: currentCommand, output }]);
    setCommandHistory(prev => [...prev, currentCommand]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = currentCommand.split(' ');
      const lastPart = parts[parts.length - 1].toLowerCase();
      if (lastPart.length > 0 && parts.length === 1) {
        const completions = Object.keys(COMMAND_CATEGORIES).filter(c => c.startsWith(lastPart));
        if (completions.length === 1) {
          parts[parts.length - 1] = completions[0];
          setCurrentCommand(parts.join(' '));
        }
      }
    }
  };

  if (!isOpen) return null;

  const prompt = `[${hostname}@MikroTik] > `;

  return (
    <div
      className={`fixed bg-black border border-[#1B4973] rounded-lg shadow-2xl overflow-hidden flex flex-col z-50 ${
        maximized ? 'inset-16' : 'inset-auto bottom-4 right-4 w-[600px] h-[400px]'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#183557] to-black border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[#4A90D9]" />
          <span className="text-sm text-white">Terminal - {hostname}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMaximized(!maximized)}
            className="p-1 hover:bg-[#0D3258] rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-[#4A90D9]" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm bg-[#0B0B0B]"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-gray-500 mb-2">
          MikroTik RouterOS {hostname} (c) 1999-2024 by MikroTik. All rights reserved.
          <br />
          Type '?' for help.
        </div>

        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <div className="flex">
              <span className="text-[#4A90D9]">{prompt}</span>
              <span className="text-white">{entry.command}</span>
            </div>
            {entry.output && (
              <pre className="text-gray-300 whitespace-pre-wrap ml-0 mt-1 text-xs">
                {entry.output}
              </pre>
            )}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-[#4A90D9]">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white ml-1 font-mono"
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
}
