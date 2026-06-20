import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { CheckCircle } from 'lucide-react';

type Mode = 'Home AP' | 'Home AP Dual' | 'CPE' | 'PTP Bridge' | 'WISP AP';

export function QuickSetPanel() {
  const [mode, setMode] = useState<Mode>('Home AP');
  const [ssid, setSsid] = useState('MikroTik');
  const [password, setPassword] = useState('');
  const [wanType, setWanType] = useState('dhcp');
  const [applied, setApplied] = useState(false);
  const hostname = useRouterStore((s) => s.hostname);

  const handleApply = () => {
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="h-full overflow-auto bg-[#101E2D] text-[#C8D6E5] text-xs">
      <div className="p-3 border-b border-[#1E3448]">
        <div className="flex gap-1 flex-wrap">
          {(['Home AP', 'Home AP Dual', 'CPE', 'PTP Bridge', 'WISP AP'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                mode === m ? 'bg-[#1B6EBE] text-white' : 'bg-[#1A2B3C] hover:bg-[#243549] text-[#8BA3BF]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <h3 className="text-[#4A90D9] font-medium mb-3 text-xs uppercase tracking-wider">Wireless</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-24 text-[#8BA3BF] shrink-0">Network Name</label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-24 text-[#8BA3BF] shrink-0">WiFi Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                  placeholder="min. 8 characters"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-24 text-[#8BA3BF] shrink-0">Frequency</label>
                <select className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none">
                  <option>2.4 GHz</option>
                  <option>5 GHz</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#4A90D9] font-medium mb-3 text-xs uppercase tracking-wider">Internet (WAN)</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-24 text-[#8BA3BF] shrink-0">Address Acquisition</label>
                <select
                  value={wanType}
                  onChange={(e) => setWanType(e.target.value)}
                  className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                >
                  <option value="dhcp">Automatic (DHCP)</option>
                  <option value="static">Static</option>
                  <option value="pppoe">PPPoE</option>
                </select>
              </div>
              {wanType === 'static' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-[#8BA3BF] shrink-0">IP Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.2/24"
                      className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-[#8BA3BF] shrink-0">Gateway</label>
                    <input
                      type="text"
                      className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div>
            <h3 className="text-[#4A90D9] font-medium mb-3 text-xs uppercase tracking-wider">Local Network</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-28 text-[#8BA3BF] shrink-0">IP Address</label>
                <input
                  defaultValue="192.168.88.1"
                  type="text"
                  className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-[#8BA3BF] shrink-0">DHCP Server</label>
                <input
                  defaultValue="enabled"
                  type="text"
                  className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#4A90D9] font-medium mb-3 text-xs uppercase tracking-wider">System</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-28 text-[#8BA3BF] shrink-0">Router Identity</label>
                <input
                  defaultValue={hostname}
                  type="text"
                  className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-28 text-[#8BA3BF] shrink-0">New Password</label>
                <input
                  type="password"
                  placeholder="Set admin password"
                  className="flex-1 px-2 py-1 bg-[#0D1B2A] border border-[#2A3F55] rounded text-white text-xs focus:border-[#4A90D9] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-3">
        <button
          onClick={handleApply}
          className="px-6 py-1.5 bg-[#1B6EBE] hover:bg-[#1557A0] text-white rounded text-xs transition-colors"
        >
          Apply Configuration
        </button>
        {applied && (
          <div className="flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle className="w-3 h-3" />
            Applied
          </div>
        )}
      </div>
    </div>
  );
}
