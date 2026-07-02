import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Course, Lab, UserProgress, CourseMaterial, CourseQuiz } from '../types';
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
  BookOpen,
  FileText,
  Video,
  FileCheck,
  ClipboardList,
} from 'lucide-react';

const LEVEL_ICONS: Record<number, typeof Router> = {
  1: Router,
  2: Route,
  3: Network,
  4: Shield,
  5: Lock,
  6: Building,
};

const MAT_ICONS: Record<string, typeof BookOpen> = {
  theory: BookOpen,
  article: FileText,
  video: Video,
  pdf: FileCheck,
  summary: ClipboardList,
};

const MAT_LABELS: Record<string, string> = {
  theory: 'Теорія',
  article: 'Стаття',
  video: 'Відео',
  pdf: 'Презентація',
  summary: 'Конспект',
};

const MAT_COLORS: Record<string, string> = {
  theory: '#2E86DE',
  article: '#10AC84',
  video: '#E74C3C',
  pdf: '#F39C12',
  summary: '#9B59B6',
};

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [quiz, setQuiz] = useState<CourseQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);
  const [allLabsCompleted, setAllLabsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'materials' | 'labs'>('materials');

  useEffect(() => {
    loadCourseData();
  }, [courseId, profile]);

  const loadCourseData = async () => {
    if (!courseId || !profile) { setLoading(false); return; }

    try {
      const [courseRes, labsRes, matsRes, quizRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('labs').select('*').eq('course_id', courseId).order('order_index'),
        supabase.from('course_materials').select('*').eq('course_id', courseId).order('order_index'),
        supabase.from('course_quizzes').select('id, material_id, title, quiz_type, questions, order_index, created_at, course_id').eq('course_id', courseId).order('order_index'),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (labsRes.data) setLabs(labsRes.data);

      if (matsRes.data) {
        setMaterials(matsRes.data.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          courseId: m.course_id as string,
          orderIndex: m.order_index as number,
          title: m.title as string,
          type: m.type as string,
          content: m.content as string | null,
          videoUrl: m.video_url as string | null,
          pdfUrl: m.pdf_url as string | null,
          imageUrls: (m.image_urls as string[]) || [],
          createdAt: m.created_at as string,
        })));
      }

      if (quizRes.data) {
        const summaryQuiz = quizRes.data.find((q: Record<string, unknown>) => q.quiz_type === 'course_summary');
        if (summaryQuiz) {
          const raw = summaryQuiz;
          setQuiz({
            id: raw.id as string,
            courseId: raw.course_id as string,
            materialId: raw.material_id as string | null,
            title: raw.title as string,
            questions: raw.questions as import('../types').QuizQuestion[],
            orderIndex: raw.order_index as number,
            createdAt: raw.created_at as string,
          });
        }
      }

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
  const levelColor = LEVEL_COLORS[course.level];

  return (
    <div className="p-6">
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад до курсів
      </Link>

      {/* Course header */}
      <div className="bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 rounded-2xl p-6 border border-navy-600 mb-6">
        <div className="flex items-start gap-6">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${levelColor}20` }}
          >
            <Icon className="w-10 h-10" style={{ color: levelColor }} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${levelColor}20`,
                  color: levelColor,
                }}
              >
                Level {course.level}
              </span>
              {isCertified && (
                <span className="flex items-center gap-1 text-sm px-2 py-0.5 rounded bg-accent-green/20 text-accent-green">
                  <Award className="w-4 h-4" />
                  Сертифіковано
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-gray-400 mb-4">{course.description}</p>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {materials.length} матеріалів
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {completedLabs}/{labs.length} лабораторних
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {totalPoints} балів зароблено
                </span>
              </div>
            </div>
          </div>
        </div>

        {labs.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Прогрес лабораторних</span>
              <span className="text-white font-medium">
                {Math.round((completedLabs / labs.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedLabs / labs.length) * 100}%`,
                  backgroundColor: levelColor,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Certification CTA */}
      {allLabsCompleted && !isCertified && (
        <div className="mb-6 p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-accent-green" />
            <div>
              <p className="font-medium text-white">Готові до сертифікації!</p>
              <p className="text-sm text-gray-400">Пройдіть фінальний іспит для отримання сертифіката</p>
            </div>
          </div>
          <Link to={`/exam/${courseId}`} className="btn-primary">
            Скласти іспит
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800 border border-navy-700 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'materials'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Навчальні матеріали
          {materials.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${activeTab === 'materials' ? 'bg-white/20' : 'bg-navy-700'}`}>
              {materials.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'labs'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          Лабораторні роботи
          {labs.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${activeTab === 'labs' ? 'bg-white/20' : 'bg-navy-700'}`}>
              {labs.length}
            </span>
          )}
        </button>
      </div>

      {/* Materials tab */}
      {activeTab === 'materials' && (
        <div className="space-y-3">
          {materials.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Матеріали ще не додані</p>
            </div>
          ) : (
            <>
              {materials.map((mat, index) => {
                const MatIcon = MAT_ICONS[mat.type] || FileText;
                const matColor = MAT_COLORS[mat.type] || '#2E86DE';
                const hasVideo = !!mat.videoUrl;
                const hasPdf = !!mat.pdfUrl;
                const hasImages = mat.imageUrls && mat.imageUrls.length > 0;

                return (
                  <Link
                    key={mat.id}
                    to={`/courses/${courseId}/material/${mat.id}`}
                    className="group relative flex items-start gap-4 p-5 bg-navy-800 border border-navy-700 rounded-xl hover:border-navy-500 transition-all hover:bg-navy-750"
                  >
                    {/* Number badge */}
                    <div className="absolute top-4 right-4 text-xs text-gray-600 font-medium">
                      #{index + 1}
                    </div>

                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${matColor}20` }}
                    >
                      <MatIcon className="w-6 h-6" style={{ color: matColor }} />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${matColor}15`, color: matColor }}
                        >
                          {MAT_LABELS[mat.type]}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {hasVideo && <Video className="w-3.5 h-3.5 text-gray-500" />}
                          {hasPdf && <FileCheck className="w-3.5 h-3.5 text-gray-500" />}
                          {hasImages && <span className="text-xs text-gray-500">{mat.imageUrls.length} фото</span>}
                        </div>
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors leading-snug">
                        {mat.title}
                      </h3>
                      {mat.content && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {mat.content.replace(/[#*`\[\]]/g, '').substring(0, 120)}...
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors shrink-0 mt-3" />
                  </Link>
                );
              })}

              {/* Quiz card */}
              {quiz && (
                <Link
                  to={`/courses/${courseId}/quiz/${quiz.id}`}
                  className="group flex items-center gap-4 p-5 bg-gradient-to-r from-primary-900/40 to-navy-800 border border-primary-700/40 rounded-xl hover:border-primary-500/60 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-500/20 text-primary-400">
                        Тест
                      </span>
                      <span className="text-xs text-gray-500">{quiz.questions.length} питань</span>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">{quiz.title}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Перевірте своє розуміння матеріалу</p>
                  </div>
                  <div className="shrink-0">
                    <span className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium group-hover:bg-primary-500 transition-colors">
                      Почати
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              )}
            </>
          )}
        </div>
      )}

      {/* Labs tab */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {labs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Лабораторні роботи ще не додані</p>
            </div>
          ) : (
            labs.map((lab, index) => {
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
                    {isCompleted && <CheckCircle className="w-6 h-6 text-accent-green" />}
                    {isInProgress && <PlayCircle className="w-6 h-6 text-accent-orange" />}
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
