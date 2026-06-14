import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Course, Lab, UserProgress } from '../types';
import { LEVEL_COLORS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../lib/constants';
import {
  Router,
  Route,
  Network,
  Shield,
  Lock,
  Building,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Clock,
  Target,
  Award,
} from 'lucide-react';

const LEVEL_ICONS: Record<number, typeof Router> = {
  1: Router,
  2: Route,
  3: Network,
  4: Shield,
  5: Lock,
  6: Building,
};

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);
  const [allLabsCompleted, setAllLabsCompleted] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId, profile]);

  const loadCourseData = async () => {
    if (!courseId || !profile) { setLoading(false); return; }

    try {
      const [courseRes, labsRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('labs').select('*').eq('course_id', courseId).order('order_index'),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (labsRes.data) setLabs(labsRes.data);

      const labIds = labsRes.data?.map((l: Record<string, string>) => l.id) || [];

      const [progressRes, certRes] = await Promise.all([
        labIds.length > 0
          ? supabase.from('user_progress').select('*').eq('user_id', profile.id).in('lab_id', labIds)
          : Promise.resolve({ data: [] as Record<string, unknown>[] }),
        supabase
          .from('certificates')
          .select('id')
          .eq('user_id', profile.id)
          .eq('course_id', courseId)
          .maybeSingle(),
      ]);

      if (progressRes.data) {
        const map: Record<string, UserProgress> = {};
        (progressRes.data as Record<string, string>[]).forEach(p => {
          map[p.lab_id] = p as unknown as UserProgress;
        });
        setProgressMap(map);
      }

      if (certRes.data) setIsCertified(true);

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (labs.length > 0 && Object.keys(progressMap).length > 0) {
      const completed = labs.every(lab => progressMap[lab.id]?.status === 'completed');
      setAllLabsCompleted(completed);
    }
  }, [labs, progressMap]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-navy-800 rounded" />
          <div className="h-32 bg-navy-800 rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-navy-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Course not found</p>
        <Link to="/courses" className="text-primary-400 hover:underline mt-2 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  const Icon = LEVEL_ICONS[course.level] || Router;
  const completedLabs = labs.filter(lab => progressMap[lab.id]?.status === 'completed').length;
  const totalPoints = labs.reduce((sum, lab) => sum + (progressMap[lab.id]?.score || 0), 0);

  return (
    <div className="p-6">
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div className="bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 rounded-2xl p-6 border border-navy-600 mb-8">
        <div className="flex items-start gap-6">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${LEVEL_COLORS[course.level]}20` }}
          >
            <Icon className="w-10 h-10" style={{ color: LEVEL_COLORS[course.level] }} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${LEVEL_COLORS[course.level]}20`,
                  color: LEVEL_COLORS[course.level],
                }}
              >
                Level {course.level}
              </span>
              {isCertified && (
                <span className="flex items-center gap-1 text-sm px-2 py-0.5 rounded bg-accent-green/20 text-accent-green">
                  <Award className="w-4 h-4" />
                  Certified
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-gray-400 mb-4">{course.description}</p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {completedLabs}/{labs.length} labs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {totalPoints} points earned
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-medium">
              {Math.round((completedLabs / labs.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completedLabs / labs.length) * 100}%`,
                backgroundColor: LEVEL_COLORS[course.level],
              }}
            />
          </div>
        </div>
      </div>

      {allLabsCompleted && !isCertified && (
        <div className="mb-8 p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-accent-green" />
            <div>
              <p className="font-medium text-white">Ready for certification!</p>
              <p className="text-sm text-gray-400">Pass the final exam to earn your certificate</p>
            </div>
          </div>
          <Link
            to={`/exam/${courseId}`}
            className="btn-primary"
          >
            Take Exam
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {labs.map((lab, index) => {
          const progress = progressMap[lab.id];
          const isCompleted = progress?.status === 'completed';
          const isInProgress = progress?.status === 'in_progress';

          return (
            <Link
              key={lab.id}
              to={`/lab/${lab.id}`}
              className="card-hover flex items-center gap-6 p-5"
            >
              <div className="w-12 h-12 rounded-lg bg-navy-700 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-gray-400">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${DIFFICULTY_COLORS[lab.difficulty]}20`,
                      color: DIFFICULTY_COLORS[lab.difficulty],
                    }}
                  >
                    {DIFFICULTY_LABELS[lab.difficulty]}
                  </span>
                  <span className="text-xs text-gray-500">{lab.points} pts</span>
                </div>
                <h3 className="font-semibold text-white mb-1">{lab.title}</h3>
                <p className="text-sm text-gray-400 truncate">{lab.description}</p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {isCompleted && (
                  <div className="text-right">
                    <CheckCircle className="w-6 h-6 text-accent-green" />
                  </div>
                )}
                {isInProgress && (
                  <div className="text-right">
                    <PlayCircle className="w-6 h-6 text-accent-orange" />
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
