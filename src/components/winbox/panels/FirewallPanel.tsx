import { useState } from 'react';
import { useRouterStore } from '../../../store/routerStore';
import { Shield, Plus, Trash2, X, AlertTriangle } from 'lucide-react';

const CHAIN_OPTIONS = ['input', 'output', 'forward'];
const ACTION_OPTIONS = ['accept', 'drop', 'reject', 'log'];
const PROTOCOL_OPTIONS = ['tcp', 'udp', 'icmp', 'all'];
const CONNECTION_STATES = ['established', 'related', 'new', 'invalid'];

export function FirewallPanel() {
  const firewallRules = useRouterStore((s) => s.firewallRules);
  const addFirewallRule = useRouterStore((s) => s.addFirewallRule);
  const removeFirewallRule = useRouterStore((s) => s.removeFirewallRule);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    chain: 'input',
    action: 'accept',
    protocol: 'tcp',
    connectionState: '',
    srcAddress: '',
    dstAddress: '',
    srcPort: '',
    dstPort: '',
    inInterface: '',
    outInterface: '',
    comment: '',
    disabled: false,
  });

  const handleAddRule = () => {
    addFirewallRule(newRule);
    setNewRule({
      chain: 'input',
      action: 'accept',
      protocol: 'tcp',
      connectionState: '',
      srcAddress: '',
      dstAddress: '',
      srcPort: '',
      dstPort: '',
      inInterface: '',
      outInterface: '',
      comment: '',
      disabled: false,
    });
    setShowAddModal(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'accept':
        return 'bg-green-500/20 text-green-400';
      case 'drop':
        return 'bg-red-500/20 text-red-400';
      case 'reject':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B2942]">
      <div className="flex items-center justify-between p-3 border-b border-[#1B4973]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#4A90D9]" />
          <h3 className="text-white font-medium">Firewall</h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedRule && (
            <button
              onClick={() => {
                removeFirewallRule(selectedRule);
                setSelectedRule(null);
              }}
              className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
              title="Remove"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 hover:bg-[#0D3258] rounded transition-colors"
            title="Add Rule"
          >
            <Plus className="w-4 h-4 text-[#4A90D9]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {firewallRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <AlertTriangle className="w-12 h-12 mb-2 opacity-30" />
            <p>No firewall rules</p>
            <p className="text-sm mt-1">All traffic is allowed</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-[#4A90D9] hover:text-white"
            >
              Add Firewall Rule
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {firewallRules.map((rule, index) => (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule.id)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedRule === rule.id
                    ? 'bg-[#1B4973]'
                    : 'bg-[#082035] hover:bg-[#0D3258]'
                } ${rule.disabled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                  <span className="text-xs px-1.5 bg-blue-500/20 text-blue-400 rounded">{rule.chain}</span>
                  <span className={`text-xs px-1.5 rounded ${getActionColor(rule.action)}`}>
                    {rule.action}
                  </span>
                </div>
                <div className="text-xs text-gray-400 flex flex-wrap gap-x-3">
                  {rule.protocol && <span>proto: {rule.protocol}</span>}
                  {rule.connectionState && <span>conn: {rule.connectionState}</span>}
                  {rule.srcAddress && <span>src: {rule.srcAddress}</span>}
                  {rule.dstAddress && <span>dst: {rule.dstAddress}</span>}
                  {rule.comment && <span className="text-yellow-400">"{rule.comment}"</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B2942] border border-[#1B4973] rounded-lg w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-[#1B4973] sticky top-0 bg-[#0B2942]">
              <h4 className="text-white font-medium">Add Firewall Rule</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#0D3258] rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Chain</label>
                  <select
                    value={newRule.chain}
                    onChange={(e) => setNewRule({ ...newRule, chain: e.target.value })}
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  >
                    {CHAIN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Action</label>
                  <select
                    value={newRule.action}
                    onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  >
                    {ACTION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Protocol</label>
                  <select
                    value={newRule.protocol}
                    onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  >
                    {PROTOCOL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Connection State</label>
                  <select
                    value={newRule.connectionState}
                    onChange={(e) => setNewRule({ ...newRule, connectionState: e.target.value })}
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  >
                    <option value="">Any</option>
                    {CONNECTION_STATES.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Source Address</label>
                  <input
                    type="text"
                    value={newRule.srcAddress}
                    onChange={(e) => setNewRule({ ...newRule, srcAddress: e.target.value })}
                    placeholder="0.0.0.0/0"
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Dest Address</label>
                  <input
                    type="text"
                    value={newRule.dstAddress}
                    onChange={(e) => setNewRule({ ...newRule, dstAddress: e.target.value })}
                    placeholder="0.0.0.0/0"
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Source Port</label>
                  <input
                    type="text"
                    value={newRule.srcPort}
                    onChange={(e) => setNewRule({ ...newRule, srcPort: e.target.value })}
                    placeholder="any"
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#4A90D9] mb-1">Dest Port</label>
                  <input
                    type="text"
                    value={newRule.dstPort}
                    onChange={(e) => setNewRule({ ...newRule, dstPort: e.target.value })}
                    placeholder="any"
                    className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#4A90D9] mb-1">Comment</label>
                <input
                  type="text"
                  value={newRule.comment}
                  onChange={(e) => setNewRule({ ...newRule, comment: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 bg-[#082035] border border-[#1B4973] rounded text-white text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={newRule.disabled}
                  onChange={(e) => setNewRule({ ...newRule, disabled: e.target.checked })}
                  className="rounded bg-[#082035] border-[#1B4973]"
                />
                <label htmlFor="disabled" className="text-sm text-gray-300">Disabled</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-3 border-t border-[#1B4973] sticky bottom-0 bg-[#0B2942]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 text-sm bg-[#2E86DE] text-white rounded hover:bg-[#2569B2]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
