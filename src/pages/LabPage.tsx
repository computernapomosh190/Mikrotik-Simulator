import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { WinBox } from '../components/winbox/WinBox';
import { Terminal } from '../components/terminal/Terminal';
import { useRouterStore } from '../store/routerStore';
import type { Lab } from '../types';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../lib/constants';
import {
  ArrowLeft,
  Terminal as TerminalIcon,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Award,
  Loader2,
} from 'lucide-react';

function validateTask(taskDesc: string, taskTitle: string, routerState: ReturnType<typeof useRouterStore.getState>): boolean {
  const desc = (taskDesc + ' ' + taskTitle).toLowerCase();

  // WinBox connection task
  if ((desc.includes('winbox') || desc.includes('підключ')) && (desc.includes('mac') || desc.includes('роутер'))) {
    return routerState.winboxConnected;
  }

  // System info / RouterOS version task
  if (desc.includes('версію routeros') || desc.includes('системн') || desc.includes('system')) {
    return routerState.systemPanelVisited;
  }

  // IP address tasks - extract IP and interface
  const ipMatch = desc.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  const ifaceMatch = desc.match(/ether\d+|bridge[\w\d-]*/);
  if (ipMatch && ifaceMatch) {
    const expectedIp = ipMatch[1];
    const expectedIface = ifaceMatch[0];
    return routerState.ipAddresses.some(
      (ip) => ip.address.startsWith(expectedIp) && ip.interface === expectedIface && !ip.disabled
    );
  }

  // IP with any interface (no specific interface mentioned)
  if (ipMatch && desc.includes('ip') && !ifaceMatch) {
    const expectedIp = ipMatch[1];
    return routerState.ipAddresses.some((ip) => ip.address.startsWith(expectedIp) && !ip.disabled);
  }

  // Static route tasks
  if (desc.includes('маршрут') || desc.includes('route') || desc.includes('routing')) {
    const routeIpMatch = desc.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d+)/);
    if (routeIpMatch) {
      const dst = routeIpMatch[1].split('/')[0];
      return routerState.routes.some((r) => r.dstAddress.startsWith(dst));
    }
    return routerState.routes.length > 0;
  }

  // Bridge tasks
  if (desc.includes('bridge')) {
    if (desc.includes('порт') || desc.includes('port') || desc.includes('ether')) {
      return routerState.bridges.some((b) => b.ports.length > 0);
    }
    return routerState.bridges.length > 0;
  }

  // VLAN tasks
  if (desc.includes('vlan')) {
    return routerState.vlans.length > 0;
  }

  // DHCP tasks
  if (desc.includes('dhcp')) {
    if (desc.includes('мереж') || desc.includes('network') || desc.includes('шлюз') || desc.includes('gateway')) {
      return routerState.dhcpServers.some((d) => d.gateway && d.gateway !== '');
    }
    if (desc.includes('pool') || desc.includes('пул')) {
      return routerState.dhcpServers.some((d) => d.addressPool && d.addressPool !== '');
    }
    return routerState.dhcpServers.length > 0;
  }

  // DNS tasks
  if (desc.includes('dns')) {
    if (desc.includes('статичн') || desc.includes('static') || desc.includes('запис')) {
      return routerState.dnsStatic.length > 0;
    }
    if (desc.includes('remote') || desc.includes('увімкн') || desc.includes('активув')) {
      return routerState.dnsClients.some((d) => d.allowRemoteRequests);
    }
    return routerState.dnsClients.length > 0;
  }

  // Firewall tasks
  if (desc.includes('firewall') || desc.includes('фаєрвол') || desc.includes('фіервол')) {
    if (desc.includes('address list') || desc.includes('address-list')) {
      return routerState.addressLists.length > 0;
    }
    if (desc.includes('rule') || desc.includes('правил')) {
      return routerState.firewallRules.length > 0;
    }
    return routerState.firewallRules.length > 0 || routerState.addressLists.length > 0;
  }

  // WireGuard / VPN tasks
  if (desc.includes('wireguard') || desc.includes('vpn') || desc.includes('l2tp') || desc.includes('ipsec')) {
    if (desc.includes('peer')) {
      return routerState.wireGuardPeers.some((p) => p.endpoint && p.endpoint !== '');
    }
    return routerState.wireGuardPeers.length > 0;
  }

  // Observation / view tasks (always pass after connection)
  if (desc.includes('перегляд') || desc.includes('перевір') || desc.includes('ознайомлен') || desc.includes('check') || desc.includes('view')) {
    return routerState.winboxConnected;
  }

  return false;
}

export function LabPage() {
  const { labId } = useParams<{ labId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [validated, setValidated] = useState(false);
  const [passed, setPassed] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [score, setScore] = useState(0);
  const [taskResults, setTaskResults] = useState<boolean[]>([]);

  const resetRouter = useRouterStore((s) => s.reset);
  const routerState = useRouterStore();

  useEffect(() => {
    loadLab();
  }, [labId]);

  const loadLab = async () => {
    if (!labId) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('labs')
        .select('*, courses(title, level)')
        .eq('id', labId)
        .single();

      if (error) throw error;
      setLab(data);
      setLoading(false);

      if (profile && data) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', profile.id)
          .eq('lab_id', labId)
          .maybeSingle();

        if (progress?.status === 'completed') {
          setPassed(true);
          setValidated(true);
          setScore(progress.score);
          setProgressSaved(true);
          if (data.tasks) {
            setTaskResults(data.tasks.map(() => true));
          }
        }
      }
    } catch (err) {
      console.error('Error loading lab:', err);
      setLoading(false);
    }
  };

  const handleCheckLab = async () => {
    if (!lab) return;
    setChecking(true);
    setValidated(false);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentState = useRouterStore.getState();

    let results: boolean[];
    if (lab.tasks.length === 0) {
      // No explicit tasks - check if any meaningful config was done
      const anyConfig =
        currentState.winboxConnected ||
        currentState.ipAddresses.length > 0 ||
        currentState.routes.length > 0 ||
        currentState.bridges.length > 0 ||
        currentState.dhcpServers.length > 0;
      results = [anyConfig];
    } else {
      results = lab.tasks.map((task) => validateTask(task.description, task.title, currentState));
    }

    setTaskResults(results);
    const allPassed = results.every(Boolean);
    const passedCount = results.filter(Boolean).length;
    const earnedPoints = allPassed
      ? lab.points
      : Math.round((passedCount / results.length) * lab.points * 0.5);

    setPassed(allPassed);
    setScore(earnedPoints);
    setChecking(false);
    setValidated(true);

    if (profile && allPassed && !progressSaved) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: profile.id,
            lab_id: lab.id,
            status: 'completed',
            score: earnedPoints,
            attempts: 1,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          });

        if (!error) {
          setProgressSaved(true);
          await supabase
            .from('profiles')
            .update({
              rating: (profile.rating || 0) + earnedPoints,
              total_labs_completed: (profile.totalLabsCompleted || 0) + 1,
            })
            .eq('id', profile.id);
        }
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }
  };

  const handleReset = () => {
    resetRouter();
    setValidated(false);
    setPassed(false);
    setScore(0);
    setProgressSaved(false);
    setTaskResults([]);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Lab not found</p>
          <button onClick={() => navigate('/labs')} className="btn-primary">
            Back to Labs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 bg-navy-800 border-b border-navy-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">{lab.title}</h1>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${DIFFICULTY_COLORS[lab.difficulty]}20`,
                  color: DIFFICULTY_COLORS[lab.difficulty],
                }}
              >
                {DIFFICULTY_LABELS[lab.difficulty]}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {/* @ts-expect-error joined data */}
              {lab.courses?.title} — {lab.points} points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="btn-ghost gap-2" title="Reset Configuration">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`btn gap-2 ${terminalOpen ? 'bg-primary-500 text-white' : 'btn-ghost'}`}
          >
            <TerminalIcon className="w-4 h-4" />
            Terminal
          </button>
          {!passed ? (
            <button
              onClick={handleCheckLab}
              disabled={checking}
              className="btn-primary gap-2"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Check Lab
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-accent-green/20 text-accent-green rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed — {score} pts</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Tasks sidebar */}
        <aside className="w-72 bg-navy-800 border-r border-navy-700 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-navy-700">
            <h2 className="text-sm font-semibold text-white mb-1">Objectives</h2>
            <p className="text-xs text-gray-400">{lab.description}</p>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Tasks</h3>
            {lab.tasks.length === 0 ? (
              <div className="p-3 bg-navy-700/50 rounded-lg">
                <p className="text-sm text-gray-300">Configure the router using WinBox or Terminal</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lab.tasks.map((task, index) => {
                  const isCompleted = taskResults[index] === true;
                  const isFailed = validated && taskResults[index] === false;

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-accent-green/10 border border-accent-green/30'
                          : isFailed
                          ? 'bg-accent-red/10 border border-accent-red/30'
                          : 'bg-navy-700/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                        ) : isFailed ? (
                          <XCircle className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
                        ) : (
                          <Play className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{task.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {validated && !passed && (
            <div className="p-4 border-t border-navy-700">
              <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-accent-red" />
                  <p className="font-medium text-white">Not Completed</p>
                </div>
                <p className="text-sm text-gray-400">
                  {taskResults.filter(Boolean).length} / {taskResults.length} tasks done. Complete all tasks and try again.
                </p>
                <button onClick={handleReset} className="mt-3 w-full btn-outline">
                  Reset & Try Again
                </button>
              </div>
            </div>
          )}

          {passed && (
            <div className="p-4 border-t border-navy-700">
              <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-accent-green" />
                  <p className="font-medium text-white">Lab Completed!</p>
                </div>
                <p className="text-sm text-gray-400">You earned {score} points.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-3 w-full btn-primary">
                  Continue Learning
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* WinBox area */}
        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full">
            <WinBox onOpenTerminal={() => setTerminalOpen(true)} />
          </div>
        </main>
      </div>

      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </div>
  );
}
