import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Course } from '../types';
import { LEVEL_COLORS } from '../lib/constants';
import {
  Router,
  Route,
  Network,
  Shield,
  Lock,
  Building,
  ChevronRight,
  CheckCircle,
  Lock as LockIcon,
  PlayCircle,
} from 'lucide-react';

const LEVEL_ICONS: Record<number, typeof Router> = {
  1: Router,
  2: Route,
  3: Network,
  4: Shield,
  5: Lock,
  6: Building,
};

export function CoursesPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [profile]);

  const loadCourses = async () => {
    if (!profile) { setLoading(false); return; }

    try {
      const [coursesRes, labsRes, certificatesRes] = await Promise.all([
        supabase.from('courses').select('*').order('order_index'),
        supabase.from('labs').select('id, course_id'),
        supabase.from('certificates').select('course_id').eq('user_id', profile.id),
      ]);

      if (coursesRes.data) {
        const labCountByCourse: Record<string, number> = {};
        labsRes.data?.forEach((lab: Record<string, string>) => {
          labCountByCourse[lab.course_id] = (labCountByCourse[lab.course_id] || 0) + 1;
        });
        setCourses(coursesRes.data.map(c => ({
          ...c,
          labsCount: labCountByCourse[c.id] || 0,
        })));
      }

      if (certificatesRes.data) {
        setCompletedCourses(certificatesRes.data.map(c => c.course_id));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-navy-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Certification Levels</h1>
        <p className="text-gray-400">
          Master each level to earn your MikroTik certification
        </p>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => {
          const Icon = LEVEL_ICONS[course.level] || Router;
          const isLocked = index > 0 && !completedCourses.includes(courses[index - 1]?.id);
          const isCompleted = completedCourses.includes(course.id);
          const isCurrent = profile?.currentCourseId === course.id;

          return (
            <div
              key={course.id}
              className={`relative overflow-hidden rounded-xl border transition-all ${
                isLocked
                  ? 'bg-navy-800/50 border-navy-700 opacity-60'
                  : isCompleted
                  ? 'bg-navy-800 border-navy-600'
                  : 'bg-navy-800 border-navy-700 hover:border-primary-500'
              } ${isCurrent ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-5"
                style={{
                  background: `radial-gradient(circle at top right, ${LEVEL_COLORS[course.level]}, transparent 70%)`,
                }}
              />

              <Link
                to={isLocked ? '#' : `/courses/${course.id}`}
                className={`relative flex items-center gap-6 p-6 ${
                  isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${LEVEL_COLORS[course.level]}20` }}
                >
                  {isLocked ? (
                    <LockIcon className="w-8 h-8" style={{ color: LEVEL_COLORS[course.level] }} />
                  ) : isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-accent-green" />
                  ) : (
                    <Icon className="w-8 h-8" style={{ color: LEVEL_COLORS[course.level] }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${LEVEL_COLORS[course.level]}20`,
                        color: LEVEL_COLORS[course.level],
                      }}
                    >
                      Level {course.level}
                    </span>
                    {isCurrent && !isCompleted && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-500/20 text-primary-400">
                        Current
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs px-2 py-0.5 rounded bg-accent-green/20 text-accent-green">
                        Certified
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-1">{course.title}</h2>
                  <p className="text-sm text-gray-400 mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{course.labsCount} labs</span>
                    <span>•</span>
                    <span>
                      {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Available'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isLocked ? (
                    <LockIcon className="w-6 h-6 text-gray-500" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-accent-green" />
                  ) : (
                    <PlayCircle className="w-6 h-6 text-primary-400" />
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
