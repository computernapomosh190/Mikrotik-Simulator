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
  ChevronRight,
  Target,
  Clock,
} from 'lucide-react';

export function LabPage() {
  const { labId } = useParams<{ labId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [checking, setChecking] = useState(false);
  const [validated, setValidated] = useState(false);
  const [passed, setPassed] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [score, setScore] = useState(0);

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

        if (progress) {
          if (progress.status === 'completed') {
            setPassed(true);
            setValidated(true);
            setScore(progress.score);
            setProgressSaved(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading lab:', error);
      setLoading(false);
    }
  };

  const handleCheckLab = async () => {
    setChecking(true);
    setValidated(false);

    await new Promise(resolve => setTimeout(resolve, 2000));

    let allTasksCompleted = true;
    let earnedPoints = 0;

    if (lab) {
      const totalTasks = lab.tasks.length;
      if (totalTasks === 0) {
        allTasksCompleted = routerState.ipAddresses.length > 0;
      } else {
        allTasksCompleted = currentTaskIndex >= totalTasks;
      }

      if (allTasksCompleted) {
        earnedPoints = lab.points;
        setPassed(true);
      } else {
        earnedPoints = Math.round((currentTaskIndex / totalTasks) * (lab.points * 0.5));
        setPassed(false);
      }

      setScore(earnedPoints);
    }

    if (profile && lab && passed) {
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
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }

    setChecking(false);
    setValidated(true);
  };

  const handleReset = () => {
    resetRouter();
    setCurrentTaskIndex(0);
    setValidated(false);
    setPassed(false);
    setScore(0);
    setProgressSaved(false);
  };

  const handleNextTask = () => {
    if (lab && currentTaskIndex < lab.tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handleCompleteLab = () => {
    handleCheckLab();
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
          <button
            onClick={() => navigate('/labs')}
            className="btn-primary"
          >
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
              {lab.courses?.title} - {lab.points} points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="btn-ghost gap-2"
            title="Reset Configuration"
          >
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
              onClick={handleCompleteLab}
              disabled={checking}
              className="btn-primary gap-2"
            >
              {checking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Check Lab
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-accent-green/20 text-accent-green rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed - {score} pts</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-navy-800 border-r border-navy-700 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-navy-700">
            <h2 className="text-sm font-semibold text-white mb-1">Objectives</h2>
            <p className="text-xs text-gray-400">{lab.description}</p>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Tasks</h3>
            {lab.tasks.length === 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-navy-700/50 rounded-lg">
                  <p className="text-sm text-gray-300">Configure the router using WinBox or Terminal</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {lab.tasks.map((task, index) => {
                  const isCompleted = index < currentTaskIndex || (passed && index === currentTaskIndex);
                  const isCurrent = index === currentTaskIndex && !passed;
                  const isPending = index > currentTaskIndex && !passed;

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-accent-green/10 border border-accent-green/30'
                          : isCurrent
                          ? 'bg-primary-500/10 border border-primary-500/30'
                          : 'bg-navy-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                        ) : isCurrent ? (
                          <Play className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 shrink-0 mt-0.5" />
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
                  Some tasks are not completed. Try again!
                </p>
                <button
                  onClick={handleReset}
                  className="mt-3 w-full btn-outline"
                >
                  Try Again
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
                <p className="text-sm text-gray-400">
                  You earned {score} points for this lab.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-3 w-full btn-primary"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          )}
        </aside>

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
