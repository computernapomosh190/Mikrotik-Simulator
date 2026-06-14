import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
  total_labs_completed: number;
}

export function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, rating, total_labs_completed')
        .order('rating', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankedUsers = data?.map((user, index) => ({
        rank: index + 1,
        user_id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        rating: user.rating,
        total_labs_completed: user.total_labs_completed,
      })) || [];

      setUsers(rankedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/10 to-transparent border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 to-transparent border-amber-600/30';
      default:
        return 'bg-navy-800 border-navy-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-navy-800 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-navy-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent-orange" />
            Leaderboard
          </h1>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly', 'all_time'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  period === p
                    ? 'bg-primary-500 text-white'
                    : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                }`}
              >
                {p === 'all_time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-400">Top performers in MikroTik Lab Simulator</p>
      </div>

      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[users[1], users[0], users[2]].filter(Boolean).map((user, displayIndex) => {
            const actualRank = displayIndex === 1 ? 1 : displayIndex === 0 ? 2 : 3;
            if (!user) return null;

            return (
              <div
                key={user.user_id}
                className={`card p-6 text-center ${getRankBg(actualRank)}`}
                style={{ order: displayIndex }}
              >
                <div className="flex justify-center mb-3">
                  {getRankIcon(actualRank)}
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-teal mx-auto flex items-center justify-center text-2xl font-bold text-white mb-3">
                  {user.display_name?.[0] || user.username[0]?.toUpperCase()}
                </div>
                <h3 className="font-semibold text-white">{user.display_name || user.username}</h3>
                <p className="text-lg font-bold text-primary-400 mt-2">{user.rating} pts</p>
                <p className="text-xs text-gray-400">{user.total_labs_completed} labs completed</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.user_id}
            className={`card flex items-center gap-4 p-4 ${getRankBg(user.rank)}`}
          >
            <div className="w-12 flex justify-center">{getRankIcon(user.rank)}</div>

            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center text-lg font-bold text-white">
              {user.display_name?.[0] || user.username[0]?.toUpperCase()}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">{user.display_name || user.username}</h3>
              <p className="text-sm text-gray-400">{user.total_labs_completed} labs completed</p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-primary-400">{user.rating}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>

            {user.rank <= 3 && (
              <TrendingUp className="w-5 h-5 text-accent-green" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
