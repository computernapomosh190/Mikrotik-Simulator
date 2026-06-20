import { useState, useEffect } from 'react';
import { useRouterStore } from '../../../store/routerStore';

interface LogEntry {
  time: string;
  topics: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
}

const BASE_LOGS: LogEntry[] = [
  { time: '14:01:23', topics: 'system,info', message: 'router started', level: 'info' },
  { time: '14:01:24', topics: 'interface', message: 'ether1 link up (speed 1G, full duplex)', level: 'info' },
  { time: '14:01:24', topics: 'interface', message: 'ether2 link up (speed 1G, full duplex)', level: 'info' },
  { time: '14:01:24', topics: 'interface', message: 'ether3 link up (speed 1G, full duplex)', level: 'info' },
  { time: '14:01:25', topics: 'dhcp,info', message: 'assigned 192.168.88.10 to 00:1A:2B:3C:4D:5E', level: 'info' },
  { time: '14:01:26', topics: 'firewall,info', message: 'rule applied: accept established connections', level: 'info' },
  { time: '14:01:30', topics: 'system,info', message: 'user admin logged in from 00:11:22:33:44:01 via winbox', level: 'info' },
];

export function LogPanel() {
  const cliHistory = useRouterStore((s) => s.cliHistory);
  const [filter, setFilter] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>(BASE_LOGS);

  useEffect(() => {
    const cliLogs: LogEntry[] = cliHistory.map((h) => ({
      time: h.timestamp.toLocaleTimeString('uk-UA', { hour12: false }),
      topics: 'script,info',
      message: `command executed: ${h.command}`,
      level: h.success ? 'info' : 'error',
    }));
    setLogs([...BASE_LOGS, ...cliLogs]);
  }, [cliHistory]);

  const filtered = logs.filter(
    (l) =>
      !filter ||
      l.message.toLowerCase().includes(filter.toLowerCase()) ||
      l.topics.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#101E2D]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2B3C] border-b border-[#2A3F55]">
        <button className="px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-[#8BA3BF] text-xs hover:text-white">
          Clear
        </button>
        <button className="px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-[#8BA3BF] text-xs hover:text-white">
          Pause
        </button>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-[#C8D6E5] text-xs outline-none focus:border-[#4A90D9] w-36"
        />
      </div>

      {/* Log table header */}
      <div className="grid text-xs font-medium text-[#4A90D9] border-b border-[#2A3F55] bg-[#142030]" style={{ gridTemplateColumns: '80px 140px 1fr' }}>
        <div className="px-3 py-1.5">Time</div>
        <div className="px-2 py-1.5">Topics</div>
        <div className="px-2 py-1.5">Message</div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-auto font-mono">
        {filtered.map((log, i) => (
          <div
            key={i}
            className={`grid text-xs border-b border-[#1A2B3C] hover:bg-[#1A2B3C] transition-colors ${
              log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-[#C8D6E5]'
            }`}
            style={{ gridTemplateColumns: '80px 140px 1fr' }}
          >
            <div className="px-3 py-1 text-[#4A90D9]">{log.time}</div>
            <div className="px-2 py-1 text-[#8BA3BF]">{log.topics}</div>
            <div className="px-2 py-1">{log.message}</div>
          </div>
        ))}
      </div>

      <div className="px-3 py-1 border-t border-[#2A3F55] text-[#4A90D9] text-xs">
        {filtered.length} entries
      </div>
    </div>
  );
}
