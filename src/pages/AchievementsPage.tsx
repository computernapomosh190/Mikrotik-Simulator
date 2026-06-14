import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Achievement } from '../types';
import { Trophy, Lock, CheckCircle } from 'lucide-react';

export function AchievementsPage() {
  const { profile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedIds, setEarnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [profile]);

  const loadAchievements = async () => {
    try {
      const [achievementsRes, earnedRes] = await Promise.all([
        supabase.from('achievements').select('*').order('points'),
        profile
          ? supabase.from('user_achievements').select('achievement_id').eq('user_id', profile.id)
          : null,
      ]);

      if (achievementsRes.data) setAchievements(achievementsRes.data);
      if (earnedRes?.data) setEarnedIds(earnedRes.data.map(e => e.achievement_id));
      setLoading(false);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-32 bg-navy-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const earnedAchievements = achievements.filter(a => earnedIds.includes(a.id));
  const lockedAchievements = achievements.filter(a => !earnedIds.includes(a.id));

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-gray-400">Earn badges and points by completing labs and courses</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-primary-400">{earnedAchievements.length}</p>
          <p className="text-sm text-gray-400">Earned</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-gray-500">{lockedAchievements.length}</p>
          <p className="text-sm text-gray-400">Locked</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-accent-orange">
            {earnedAchievements.reduce((sum, a) => sum + a.points, 0)}
          </p>
          <p className="text-sm text-gray-400">Points from Achievements</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-accent-green">
            {Math.round((earnedAchievements.length / achievements.length) * 100)}%
          </p>
          <p className="text-sm text-gray-400">Completion</p>
        </div>
      </div>

      {earnedAchievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Earned Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="card p-4 border-accent-orange/30 bg-gradient-to-br from-accent-orange/5 to-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent-orange/20 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-accent-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{achievement.name}</h3>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                    <p className="text-xs text-accent-orange mt-1">+{achievement.points} pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Locked Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lockedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="card p-4 opacity-60"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-300">{achievement.name}</h3>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                  <p className="text-xs text-gray-600 mt-1">+{achievement.points} pts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
