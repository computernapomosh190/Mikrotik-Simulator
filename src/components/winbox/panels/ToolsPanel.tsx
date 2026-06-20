import { useState } from 'react';
import { Play, Square } from 'lucide-react';

type Tool = 'ping' | 'traceroute' | 'bandwidth' | 'netwatch' | 'profile';

interface PingResult {
  seq: number;
  host: string;
  size: number;
  ttl: number;
  time: string;
  status: 'success' | 'timeout';
}

export function ToolsPanel({ tool = 'ping' }: { tool?: Tool }) {
  const [host, setHost] = useState('8.8.8.8');
  const [count, setCount] = useState('4');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);

  const runPing = async () => {
    if (running) { setRunning(false); return; }
    setRunning(true);
    setResults([]);
    const total = Math.min(parseInt(count) || 4, 10);
    for (let i = 1; i <= total; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const rtt = (Math.random() * 20 + 1).toFixed(1);
      setResults((prev) => [
        ...prev,
        { seq: i, host, size: 56, ttl: 117, time: `${rtt}ms`, status: 'success' },
      ]);
    }
    setRunning(false);
  };

  const sent = results.length;
  const recv = results.filter((r) => r.status === 'success').length;
  const avgTime = recv > 0
    ? (results.filter((r) => r.status === 'success').reduce((s, r) => s + parseFloat(r.time), 0) / recv).toFixed(1) + 'ms'
    : '-';

  if (tool === 'traceroute') {
    return (
      <div className="h-full flex flex-col bg-[#101E2D] p-4 text-xs text-[#C8D6E5] gap-3">
        <div className="flex gap-2 items-center">
          <label className="text-[#8BA3BF] w-24">Host</label>
          <input defaultValue="8.8.8.8" className="px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs outline-none focus:border-[#4A90D9]" />
          <button className="px-3 py-1 bg-[#1B6EBE] text-white rounded text-xs flex items-center gap-1">
            <Play className="w-3 h-3" /> Start
          </button>
        </div>
        <div className="flex-1 bg-[#0D1B2A] border border-[#2A3F55] rounded p-3 font-mono text-[#8BA3BF]">
          <p className="text-[#4A90D9]">Traceroute to 8.8.8.8</p>
          <p>1. 192.168.1.1  1.2ms</p>
          <p>2. 10.0.0.1  4.5ms</p>
          <p>3. * * *</p>
          <p>4. 8.8.8.8  22.3ms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#101E2D]">
      {/* Config */}
      <div className="p-3 border-b border-[#2A3F55] bg-[#1A2B3C] grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-[#8BA3BF] w-20 shrink-0">Host</label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white outline-none focus:border-[#4A90D9]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#8BA3BF] w-20 shrink-0">Count</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white outline-none focus:border-[#4A90D9] w-20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#8BA3BF] w-20 shrink-0">Interval</label>
          <input
            defaultValue="1"
            type="text"
            className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white outline-none focus:border-[#4A90D9]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#8BA3BF] w-20 shrink-0">Size</label>
          <input
            defaultValue="56"
            type="text"
            className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white outline-none focus:border-[#4A90D9]"
          />
        </div>
        <div className="col-span-2 flex gap-2">
          <button
            onClick={runPing}
            className={`flex items-center gap-1 px-4 py-1 rounded text-xs text-white transition-colors ${
              running ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1B6EBE] hover:bg-[#1557A0]'
            }`}
          >
            {running ? <><Square className="w-3 h-3" /> Stop</> : <><Play className="w-3 h-3" /> Start</>}
          </button>
        </div>
      </div>

      {/* Results table header */}
      <div className="grid text-xs text-[#4A90D9] bg-[#142030] border-b border-[#2A3F55]" style={{ gridTemplateColumns: '40px 1fr 60px 40px 80px 70px' }}>
        {['Seq', 'Host', 'Size', 'TTL', 'Time', 'Status'].map((h) => (
          <div key={h} className="px-2 py-1.5 font-medium">{h}</div>
        ))}
      </div>

      <div className="flex-1 overflow-auto font-mono">
        {results.map((r) => (
          <div
            key={r.seq}
            className="grid text-xs text-[#C8D6E5] border-b border-[#1A2B3C] hover:bg-[#1A2B3C]"
            style={{ gridTemplateColumns: '40px 1fr 60px 40px 80px 70px' }}
          >
            <div className="px-2 py-1 text-[#8BA3BF]">{r.seq}</div>
            <div className="px-2 py-1">{r.host}</div>
            <div className="px-2 py-1">{r.size}</div>
            <div className="px-2 py-1">{r.ttl}</div>
            <div className="px-2 py-1 text-green-400">{r.time}</div>
            <div className={`px-2 py-1 ${r.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {r.status === 'success' ? 'echo reply' : 'timeout'}
            </div>
          </div>
        ))}
        {running && (
          <div className="px-4 py-2 text-[#4A90D9] text-xs animate-pulse">pinging {host}...</div>
        )}
      </div>

      {results.length > 0 && (
        <div className="px-3 py-1.5 border-t border-[#2A3F55] text-xs text-[#8BA3BF] flex gap-4">
          <span>Sent: <span className="text-white">{sent}</span></span>
          <span>Received: <span className="text-green-400">{recv}</span></span>
          <span>Lost: <span className="text-red-400">{sent - recv}</span></span>
          <span>Avg RTT: <span className="text-white">{avgTime}</span></span>
        </div>
      )}
    </div>
  );
}
