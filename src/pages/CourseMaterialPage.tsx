import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { CourseMaterial, Course, CourseQuiz, QuizQuestion } from '../types';
import { LEVEL_COLORS } from '../lib/constants';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Video,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Play,
  Image as ImageIcon,
  ClipboardList,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  Info,
} from 'lucide-react';

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  theory: BookOpen,
  article: FileText,
  video: Video,
  pdf: FileCheck,
  summary: ClipboardList,
};

const TYPE_LABELS: Record<string, string> = {
  theory: 'Теорія',
  article: 'Стаття',
  video: 'Відео',
  pdf: 'Презентація',
  summary: 'Конспект',
};

const TYPE_COLORS: Record<string, string> = {
  theory: '#2E86DE',
  article: '#10AC84',
  video: '#E74C3C',
  pdf: '#F39C12',
  summary: '#9B59B6',
};

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3 pb-2 border-b border-navy-600">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code class="bg-navy-700 text-primary-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/```(?:\w+)?\n([\s\S]+?)```/g, '<pre class="bg-navy-900 border border-navy-700 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono text-gray-200 whitespace-pre">$1</code></pre>')
    .replace(/^\| (.+) \|$/gm, (_, row) => {
      const cells = row.split(' | ');
      return `<tr>${cells.map((c: string) => `<td class="border border-navy-600 px-3 py-2 text-gray-300 text-sm">${c}</td>`).join('')}</tr>`;
    })
    .replace(/^\|[-| ]+\|$/gm, '')
    .replace(/(<tr>[\s\S]+?<\/tr>)/g, (match) => `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-navy-600 rounded-lg overflow-hidden">${match}</table></div>`)
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-primary-500/10 rounded-r-lg"><p class="text-gray-300 italic text-sm">$1</p></blockquote>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="flex items-center gap-2 text-gray-400 my-1"><span class="w-4 h-4 border border-gray-500 rounded flex-shrink-0"></span>$1</li>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 text-gray-300 my-1"><span class="text-primary-400 mt-1 flex-shrink-0">•</span>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 text-gray-300 my-1"><span class="text-primary-400 font-semibold flex-shrink-0">$1.</span>$2</li>')
    .replace(/^---$/gm, '<hr class="border-navy-600 my-6">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline inline-flex items-center gap-1">$1</a>')
    .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed my-2">')
    .replace(/^(?!<[hbpltdr]|```|<div|<block)(.+)$/gm, '<p class="text-gray-300 leading-relaxed my-2">$1</p>');
}

// ─── Inline Mini Quiz ─────────────────────────────────────────────────────────
function MiniQuiz({ quiz }: { quiz: CourseQuiz }) {
  const questions = quiz.questions;
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [finished, setFinished] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const q: QuizQuestion = questions[currentQ];
  const isAnswered = selected !== null;
  const isCorrect = selected === q.correct;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    const na = [...answers];
    na[currentQ] = idx;
    setAnswers(na);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(i => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswers(new Array(questions.length).fill(null));
    setFinished(false);
  };

  if (!expanded) {
    return (
      <div className="border border-primary-700/40 bg-primary-900/20 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{quiz.title}</p>
            <p className="text-sm text-gray-400">{questions.length} питань для самоперевірки</p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-colors text-sm font-medium"
          >
            Почати тест
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    const pct = Math.round((correct / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <div className="border border-navy-700 bg-navy-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${passed ? 'bg-accent-green/20' : 'bg-red-500/20'}`}>
            {passed ? <Trophy className="w-6 h-6 text-accent-green" /> : <XCircle className="w-6 h-6 text-red-400" />}
          </div>
          <div>
            <p className="font-semibold text-white">{passed ? 'Відмінно!' : 'Спробуйте ще раз'}</p>
            <p className="text-sm text-gray-400">Правильних відповідей: {correct} / {questions.length} ({pct}%)</p>
          </div>
          <button onClick={reset} className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-navy-700 text-gray-300 rounded-xl hover:bg-navy-600 text-sm">
            <RotateCcw className="w-3.5 h-3.5" /> Знову
          </button>
        </div>
        <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: passed ? '#10AC84' : '#E74C3C' }} />
        </div>
        {/* Answer review */}
        <div className="mt-4 space-y-2">
          {questions.map((q, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${answers[i] === q.correct ? 'bg-accent-green/10 text-accent-green' : 'bg-red-500/10 text-red-400'}`}>
              {answers[i] === q.correct ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="font-medium text-white/90 text-xs">{q.question}</p>
                {answers[i] !== q.correct && <p className="text-xs mt-0.5">{q.explanation}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-navy-700 bg-navy-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-gray-300">{quiz.title}</span>
        </div>
        <span className="text-xs text-gray-500">{currentQ + 1} / {questions.length}</span>
      </div>
      {/* Progress */}
      <div className="h-1 bg-navy-700 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      {/* Question */}
      <p className="text-white font-medium mb-4 leading-snug">{q.question}</p>
      {/* Options */}
      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          let cls = 'border-navy-600 bg-navy-700/50 text-gray-300 hover:border-navy-500 hover:bg-navy-700 cursor-pointer';
          if (isAnswered) {
            if (i === q.correct) cls = 'border-accent-green bg-accent-green/10 text-accent-green cursor-default';
            else if (i === selected) cls = 'border-red-500 bg-red-500/10 text-red-400 cursor-default';
            else cls = 'border-navy-600 bg-navy-700/30 text-gray-500 cursor-default opacity-50';
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={isAnswered}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm flex items-center gap-3 transition-all ${cls}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {isAnswered && i === q.correct && <CheckCircle className="w-4 h-4 shrink-0" />}
              {isAnswered && i === selected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
            </button>
          );
        })}
      </div>
      {/* Explanation */}
      {isAnswered && (
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border mb-4 ${isCorrect ? 'border-accent-green/30 bg-accent-green/10' : 'border-red-500/30 bg-red-500/10'}`}>
          {isCorrect ? <CheckCircle className="w-4 h-4 text-accent-green mt-0.5 shrink-0" /> : <Info className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
          <p className="text-sm text-gray-300">{q.explanation}</p>
        </div>
      )}
      {/* Next */}
      {isAnswered && (
        <div className="flex justify-end">
          <button onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 text-sm font-medium">
            {currentQ < questions.length - 1 ? 'Наступне' : 'Завершити'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function CourseMaterialPage() {
  const { courseId, materialId } = useParams<{ courseId: string; materialId: string }>();
  const { profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [material, setMaterial] = useState<CourseMaterial | null>(null);
  const [allMaterials, setAllMaterials] = useState<CourseMaterial[]>([]);
  const [miniQuiz, setMiniQuiz] = useState<CourseQuiz | null>(null);
  const [fullQuizId, setFullQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && materialId && profile) loadData();
  }, [courseId, materialId, profile]);

  const loadData = async () => {
    try {
      const [courseRes, materialRes, allMatsRes, quizzesRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('course_materials').select('*').eq('id', materialId).single(),
        supabase.from('course_materials').select('id, order_index, title, type').eq('course_id', courseId).order('order_index'),
        supabase.from('course_quizzes').select('*').eq('course_id', courseId).eq('material_id', materialId),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (materialRes.data) {
        const raw = materialRes.data;
        setMaterial({
          id: raw.id,
          courseId: raw.course_id,
          orderIndex: raw.order_index,
          title: raw.title,
          type: raw.type,
          content: raw.content,
          videoUrl: raw.video_url,
          pdfUrl: raw.pdf_url,
          imageUrls: raw.image_urls || [],
          createdAt: raw.created_at,
        });
      }
      if (allMatsRes.data) {
        setAllMaterials(allMatsRes.data.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          courseId: courseId!,
          orderIndex: m.order_index as number,
          title: m.title as string,
          type: m.type as string,
          content: null, videoUrl: null, pdfUrl: null, imageUrls: [], createdAt: '',
        })));
      }
      if (quizzesRes.data) {
        const mini = quizzesRes.data.find((q: Record<string, unknown>) => q.quiz_type === 'per_material');
        const full = quizzesRes.data.find((q: Record<string, unknown>) => q.quiz_type === 'course_summary');
        if (mini) {
          setMiniQuiz({
            id: mini.id,
            courseId: mini.course_id,
            materialId: mini.material_id,
            title: mini.title,
            questions: mini.questions as QuizQuestion[],
            orderIndex: mini.order_index,
            createdAt: mini.created_at,
          });
        }
        if (full) setFullQuizId(full.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-navy-800 rounded" />
          <div className="h-64 bg-navy-800 rounded-xl" />
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-5 bg-navy-800 rounded" />)}</div>
        </div>
      </div>
    );
  }

  if (!material || !course) {
    return (
      <div className="p-6 text-center text-gray-400">
        Матеріал не знайдено.{' '}
        <Link to={`/courses/${courseId}`} className="text-primary-400 hover:underline">Назад</Link>
      </div>
    );
  }

  const Icon = TYPE_ICONS[material.type] || FileText;
  const typeColor = TYPE_COLORS[material.type] || '#2E86DE';
  const levelColor = LEVEL_COLORS[course.level];
  const currentIdx = allMaterials.findIndex(m => m.id === material.id);
  const prevMat = currentIdx > 0 ? allMaterials[currentIdx - 1] : null;
  const nextMat = currentIdx < allMaterials.length - 1 ? allMaterials[currentIdx + 1] : null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link to="/courses" className="hover:text-white transition-colors">Курси</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/courses/${courseId}`} className="hover:text-white transition-colors">{course.title}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300 truncate">{material.title}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-6 border" style={{ background: `linear-gradient(135deg, ${levelColor}10, ${typeColor}08)`, borderColor: `${levelColor}30` }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeColor}20` }}>
            <Icon className="w-7 h-7" style={{ color: typeColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${typeColor}20`, color: typeColor }}>
                {TYPE_LABELS[material.type]}
              </span>
              <span className="text-xs text-gray-500">Матеріал {material.orderIndex} з {allMaterials.length}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">{material.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 sticky top-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Матеріали курсу</p>
            <div className="space-y-1">
              {allMaterials.map((m) => {
                const MIcon = TYPE_ICONS[m.type] || FileText;
                const mColor = TYPE_COLORS[m.type] || '#2E86DE';
                const isActive = m.id === material.id;
                return (
                  <Link key={m.id} to={`/courses/${courseId}/material/${m.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-primary-500/20 text-primary-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
                    <MIcon className="w-4 h-4 shrink-0" style={{ color: mColor }} />
                    <span className="truncate leading-snug">{m.title}</span>
                  </Link>
                );
              })}
            </div>
            {fullQuizId && (
              <Link to={`/courses/${courseId}/quiz/${fullQuizId}`}
                className="mt-4 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors text-sm font-medium">
                <ClipboardList className="w-4 h-4" />
                Фінальний тест
              </Link>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Images */}
          {material.imageUrls && material.imageUrls.length > 0 && (
            <div className={`grid gap-3 ${material.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {material.imageUrls.map((url, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-navy-700 cursor-zoom-in group" onClick={() => setLightboxImg(url)}>
                  <img src={url} alt={`Зображення ${i + 1}`} className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video */}
          {material.videoUrl && (
            <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-700">
                <Play className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-gray-300">Відео до теми</span>
              </div>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={material.videoUrl}
                  title="Відео"
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* PDF */}
          {material.pdfUrl && (
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Презентація PDF</p>
                <p className="text-sm text-gray-400">Завантажити або переглянути</p>
              </div>
              <a href={material.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm font-medium">
                <ExternalLink className="w-4 h-4" />Відкрити
              </a>
            </div>
          )}

          {/* Text content */}
          {material.content && (
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
              <div className="prose-custom max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(material.content) }} />
            </div>
          )}

          {/* MikroTik official links */}
          {material.type === 'theory' && (
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Офіційні ресурси MikroTik</p>
                <p className="text-xs text-gray-400">Документація, форум та завантаження</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href="https://mikrotik.com" target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors">
                  mikrotik.com
                </a>
                <a href="https://help.mikrotik.com" target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-navy-700 text-gray-300 rounded-lg hover:bg-navy-600 transition-colors">
                  help.mikrotik.com
                </a>
              </div>
            </div>
          )}

          {/* ── Inline mini quiz after content ── */}
          {miniQuiz && <MiniQuiz quiz={miniQuiz} />}

          {/* Full course quiz CTA (only on last material) */}
          {fullQuizId && !nextMat && (
            <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-accent-green" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Фінальний тест курсу</p>
                <p className="text-sm text-gray-400">15 питань — перевірте знання всього курсу</p>
              </div>
              <Link to={`/courses/${courseId}/quiz/${fullQuizId}`}
                className="px-5 py-2.5 bg-accent-green text-navy-900 font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm">
                Пройти тест
              </Link>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 pt-2">
            {prevMat ? (
              <Link to={`/courses/${courseId}/material/${prevMat.id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-navy-800 border border-navy-700 rounded-xl text-gray-300 hover:text-white hover:border-navy-500 transition-all text-sm">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block truncate max-w-[120px]">{prevMat.title}</span>
                <span className="sm:hidden">Назад</span>
              </Link>
            ) : (
              <Link to={`/courses/${courseId}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-navy-800 border border-navy-700 rounded-xl text-gray-300 hover:text-white hover:border-navy-500 transition-all text-sm">
                <ArrowLeft className="w-4 h-4" />До курсу
              </Link>
            )}
            <div className="flex-1" />
            {nextMat && (
              <Link to={`/courses/${courseId}/material/${nextMat.id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all text-sm font-medium">
                <span className="hidden sm:block truncate max-w-[120px]">{nextMat.title}</span>
                <span className="sm:hidden">Далі</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden mt-6 bg-navy-800 border border-navy-700 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Всі матеріали</p>
        <div className="space-y-1">
          {allMaterials.map((m) => {
            const MIcon = TYPE_ICONS[m.type] || FileText;
            const mColor = TYPE_COLORS[m.type] || '#2E86DE';
            const isActive = m.id === material.id;
            return (
              <Link key={m.id} to={`/courses/${courseId}/material/${m.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-primary-500/20 text-primary-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
                <MIcon className="w-4 h-4 shrink-0" style={{ color: mColor }} />
                <span className="truncate">{m.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Збільшене зображення" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
