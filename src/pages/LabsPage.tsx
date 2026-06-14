import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Lab } from '../types';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../lib/constants';
import {
  Server,
  PlayCircle,
  CheckCircle,
  Clock,
  Trophy,
  Filter,
  Loader2,
} from 'lucide-react';

interface LabWithProgress extends Lab {
  progress?: {
    status: string;
    score: number;
  };
}

export function LabsPage() {
  const { profile } = useAuth();
  const [labs, setLabs] = useState<LabWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    loadLabs();
  }, [profile]);

  const loadLabs = async () => {
    if (!profile) { setLoading(false); return; }

    try {
      const { data: labsData, error } = await supabase
        .from('labs')
        .select('*, courses(title, level)')
        .order('order_index');

      if (error) throw error;

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lab_id, status, score')
        .eq('user_id', profile.id);

      const progressMap: Record<string, { status: string; score: number }> = {};
      progressData?.forEach(p => {
        progressMap[p.lab_id] = { status: p.status, score: p.score || 0 };
      });

      const labsWithProgress = labsData?.map(lab => ({
        ...lab,
        progress: progressMap[lab.id],
      })) || [];

      setLabs(labsWithProgress);
      setLoading(false);
    } catch (error) {
      console.error('Error loading labs:', error);
      setLoading(false);
    }
  };

  const filteredLabs = labs.filter(lab => {
    if (filter !== 'all') {
      const status = lab.progress?.status || 'not_started';
      if (filter !== status) return false;
    }
    if (selectedDifficulty !== 'all' && lab.difficulty !== selectedDifficulty) {
      return false;
    }
    return true;
  });

  const stats = {
    total: labs.length,
    completed: labs.filter(l => l.progress?.status === 'completed').length,
    inProgress: labs.filter(l => l.progress?.status === 'in_progress').length,
    totalPoints: labs.reduce((sum, lab) => sum + (lab.progress?.score || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-navy-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-navy-800 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-navy-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">All Labs</h1>
        <p className="text-gray-400">Practice MikroTik network administration hands-on</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
              <Server className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-400">Total Labs</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-green/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-orange/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalPoints}</p>
              <p className="text-xs text-gray-400">Points Earned</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter:</span>
        </div>
        <div className="flex gap-2">
          {['all', 'not_started', 'in_progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              {f === 'not_started' ? 'Not Started' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d as typeof selectedDifficulty)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedDifficulty === d
                  ? 'bg-navy-600 text-white'
                  : 'bg-navy-800 text-gray-400 hover:bg-navy-700'
              }`}
            >
              {d === 'all' ? 'All Levels' : DIFFICULTY_LABELS[d as 'beginner' | 'intermediate' | 'advanced']}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredLabs.map((lab) => {
          const isCompleted = lab.progress?.status === 'completed';
          const isInProgress = lab.progress?.status === 'in_progress';
          // @ts-expect-error joined data
          const course = lab.courses;

          return (
            <Link
              key={lab.id}
              to={`/lab/${lab.id}`}
              className="card-hover flex items-center gap-6 p-4"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isCompleted
                    ? 'bg-accent-green/20'
                    : isInProgress
                    ? 'bg-accent-orange/20'
                    : 'bg-navy-700'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-accent-green" />
                ) : isInProgress ? (
                  <Clock className="w-6 h-6 text-accent-orange" />
                ) : (
                  <PlayCircle className="w-6 h-6 text-primary-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${DIFFICULTY_COLORS[lab.difficulty]}20`,
                      color: DIFFICULTY_COLORS[lab.difficulty],
                    }}
                  >
                    {DIFFICULTY_LABELS[lab.difficulty]}
                  </span>
                  {course && (
                    <span className="text-xs text-gray-500">
                      Level {course.level} - {course.title}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white">{lab.title}</h3>
                <p className="text-sm text-gray-400 truncate">{lab.description}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-white">{lab.points}</p>
                <p className="text-xs text-gray-400">points</p>
              </div>

              {isCompleted && (
                <div className="shrink-0 px-3 py-1 bg-accent-green/20 rounded-full">
                  <span className="text-sm text-accent-green font-medium">
                    +{lab.progress?.score || 0} pts
                  </span>
                </div>
              )}
            </Link>
          );
        })}

        {filteredLabs.length === 0 && (
          <div className="card p-8 text-center">
            <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No labs match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
