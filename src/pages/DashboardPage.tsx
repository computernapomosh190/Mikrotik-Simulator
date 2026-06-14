import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Course, UserProgress, Certificate, Achievement } from '../types';
import {
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  PlayCircle,
  Lock,
  Star,
  Zap,
} from 'lucide-react';
import { LEVEL_COLORS } from '../lib/constants';

interface DashboardStats {
  totalLabs: number;
  completedLabs: number;
  totalPoints: number;
  currentStreak: number;
}

export function DashboardPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentProgress, setRecentProgress] = useState<UserProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLabs: 0,
    completedLabs: 0,
    totalPoints: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      const [coursesRes, labsCountRes, progressRes, certificatesRes, achievementsRes] = await Promise.all([
        supabase.from('courses').select('*').order('order_index'),
        supabase.from('labs').select('id, course_id'),
        supabase
          .from('user_progress')
          .select('*, labs(title, course_id)')
          .eq('user_id', profile.id)
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('certificates')
          .select('*, courses(title, level)')
          .eq('user_id', profile.id),
        supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', profile.id)
          .limit(4),
      ]);

      if (coursesRes.data) {
        const labCountByCourse: Record<string, number> = {};
        labsCountRes.data?.forEach((lab: Record<string, string>) => {
          labCountByCourse[lab.course_id] = (labCountByCourse[lab.course_id] || 0) + 1;
        });
        setCourses(coursesRes.data.map(c => ({
          ...c,
          labsCount: labCountByCourse[c.id] || 0,
        })));
      }

      if (progressRes.data) {
        setRecentProgress(progressRes.data);
      }

      if (certificatesRes.data) {
        setCertificates(certificatesRes.data);
      }

      if (achievementsRes.data) {
        setAchievements(achievementsRes.data.map(a => ({
          ...a.achievements,
          earnedAt: a.earned_at,
        })));
      }

      const { count: totalLabs } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      const { count: completedLabs } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'completed');

      setStats({
        totalLabs: totalLabs || 0,
        completedLabs: completedLabs || 0,
        totalPoints: profile.rating || 0,
        currentStreak: 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-navy-800 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-navy-800 rounded-xl" />
            <div className="h-24 bg-navy-800 rounded-xl" />
            <div className="h-24 bg-navy-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const completedCourses = certificates.length;
  const progressPercentage = stats.totalLabs > 0
    ? Math.round((stats.completedLabs / stats.totalLabs) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 rounded-2xl p-6 border border-navy-600">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {profile?.displayName || profile?.username}!
            </h1>
            <p className="text-gray-400">
              Continue your journey to becoming a MikroTik certified professional
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-400">{profile?.currentLevel || 1}</p>
              <p className="text-xs text-gray-400">Current Level</p>
            </div>
            <div className="w-px h-12 bg-navy-600" />
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-green">{stats.completedLabs}</p>
              <p className="text-xs text-gray-400">Labs Done</p>
            </div>
            <div className="w-px h-12 bg-navy-600" />
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-orange">{stats.totalPoints}</p>
              <p className="text-xs text-gray-400">Points</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white font-medium">{progressPercentage}%</span>
          </div>
          <div className="h-3 bg-navy-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-teal rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-accent-green" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.completedLabs}</h3>
          <p className="text-sm text-gray-400">Labs Completed</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent-green" />
            </div>
            <Star className="w-5 h-5 text-accent-orange" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.totalPoints}</h3>
          <p className="text-sm text-gray-400">Total Points</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-accent-purple" />
            </div>
            <Zap className="w-5 h-5 text-accent-orange" />
          </div>
          <h3 className="text-2xl font-bold text-white">{completedCourses}</h3>
          <p className="text-sm text-gray-400">Certificates Earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Certification Levels</h2>
            <Link to="/courses" className="text-sm text-primary-400 hover:text-primary-300">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {courses.map((course, index) => {
              const isLocked = index > 0 && !certificates.some(c => c.course_id === courses[index - 1]?.id);
              const isCompleted = certificates.some(c => c.course_id === course.id);
              const isCurrent = profile?.currentCourseId === course.id;

              return (
                <Link
                  key={course.id}
                  to={isLocked ? '#' : `/courses/${course.id}`}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isLocked
                      ? 'bg-navy-800/50 opacity-60 cursor-not-allowed'
                      : 'bg-navy-700/50 hover:bg-navy-700'
                  } ${isCurrent ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${LEVEL_COLORS[course.level]}20` }}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5" style={{ color: LEVEL_COLORS[course.level] }} />
                    ) : isCompleted ? (
                      <CheckCircle className="w-5 h-5" style={{ color: LEVEL_COLORS[course.level] }} />
                    ) : (
                      <span className="text-lg font-bold" style={{ color: LEVEL_COLORS[course.level] }}>
                        {course.level}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{course.title}</h3>
                    <p className="text-sm text-gray-400">{course.labsCount} labs</p>
                  </div>
                  {isCompleted && (
                    <Award className="w-5 h-5 text-accent-green" />
                  )}
                  {!isLocked && !isCompleted && (
                    <PlayCircle className="w-5 h-5 text-primary-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            {recentProgress.length === 0 ? (
              <div className="text-center py-8">
                <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No activity yet</p>
                <p className="text-sm text-gray-500">Start a lab to see your progress here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProgress.map((progress) => (
                  <div
                    key={progress.id}
                    className="flex items-center gap-3 p-3 bg-navy-700/50 rounded-lg"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      progress.status === 'completed'
                        ? 'bg-accent-green/20'
                        : progress.status === 'in_progress'
                        ? 'bg-accent-orange/20'
                        : 'bg-gray-600/20'
                    }`}>
                      {progress.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-accent-orange" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {/* @ts-expect-error joined data */}
                        {progress.labs?.title || 'Unknown Lab'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {progress.status === 'completed' ? `${progress.score} points` : 'In Progress'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Achievements</h2>
              <Link to="/achievements" className="text-sm text-primary-400 hover:text-primary-300">
                View All
              </Link>
            </div>
            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No achievements yet</p>
                <p className="text-sm text-gray-500">Complete labs to earn achievements</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-navy-700/50 rounded-lg text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-5 h-5 text-accent-orange" />
                    </div>
                    <p className="text-sm font-medium text-white">{achievement.name}</p>
                    <p className="text-xs text-gray-400">+{achievement.points} pts</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
