import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { CourseQuiz, QuizQuestion, Course } from '../types';
import { LEVEL_COLORS } from '../lib/constants';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronRight,
  Trophy,
  RotateCcw,
  ClipboardList,
  Info,
} from 'lucide-react';

export function CourseQuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const { profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<CourseQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  useEffect(() => {
    if (courseId && quizId && profile) loadData();
  }, [courseId, quizId, profile]);

  const loadData = async () => {
    try {
      const [courseRes, quizRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('course_quizzes').select('*').eq('id', quizId).single(),
      ]);
      if (courseRes.data) setCourse(courseRes.data);
      if (quizRes.data) {
        const raw = quizRes.data;
        const q: CourseQuiz = {
          id: raw.id,
          courseId: raw.course_id,
          materialId: raw.material_id,
          title: raw.title,
          questions: raw.questions as QuizQuestion[],
          orderIndex: raw.order_index,
          createdAt: raw.created_at,
        };
        setQuiz(q);
        setAnswers(new Array(q.questions.length).fill(null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-navy-800 rounded" />
          <div className="h-64 bg-navy-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!quiz || !course) {
    return (
      <div className="p-6 text-center text-gray-400">
        Тест не знайдено.{' '}
        <Link to={`/courses/${courseId}`} className="text-primary-400 hover:underline">Назад</Link>
      </div>
    );
  }

  const questions = quiz.questions;
  const levelColor = LEVEL_COLORS[course.level];

  // Results view
  if (finished && !reviewMode) {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    const pct = Math.round((correct / questions.length) * 100);
    const passed = pct >= 60;

    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до курсу
        </Link>

        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 text-center mb-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${
              passed ? 'bg-accent-green/20' : 'bg-red-500/20'
            }`}
          >
            {passed
              ? <Trophy className="w-12 h-12 text-accent-green" />
              : <XCircle className="w-12 h-12 text-red-400" />
            }
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Чудово! Ви склали тест!' : 'Продовжуйте вчитися!'}
          </h2>
          <p className="text-gray-400 mb-6">
            {passed ? 'Ви добре засвоїли матеріал.' : 'Перегляньте матеріали та спробуйте знову.'}
          </p>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: passed ? '#10AC84' : '#E74C3C' }}>{pct}%</p>
              <p className="text-sm text-gray-400 mt-1">Результат</p>
            </div>
            <div className="w-px h-12 bg-navy-700" />
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{correct}/{questions.length}</p>
              <p className="text-sm text-gray-400 mt-1">Правильних</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-navy-700 rounded-full overflow-hidden mb-6 max-w-xs mx-auto">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                backgroundColor: passed ? '#10AC84' : '#E74C3C',
              }}
            />
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                setAnswers(new Array(questions.length).fill(null));
                setCurrentQ(0);
                setSelected(null);
                setShowExplanation(false);
                setFinished(false);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-navy-700 text-gray-300 rounded-xl hover:bg-navy-600 transition-colors font-medium text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Спробувати знову
            </button>
            <button
              onClick={() => { setReviewMode(true); setReviewIdx(0); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-colors font-medium text-sm"
            >
              <ClipboardList className="w-4 h-4" />
              Переглянути відповіді
            </button>
          </div>
        </div>

        {/* Question summary list */}
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-300 mb-3">Огляд відповідей</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correct;
              return (
                <button
                  key={i}
                  onClick={() => { setReviewMode(true); setReviewIdx(i); }}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                    isCorrect ? 'bg-accent-green/20 text-accent-green' : 'bg-red-500/20 text-red-400'
                  } hover:opacity-80`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Review mode
  if (reviewMode) {
    const q = questions[reviewIdx];
    const userAnswer = answers[reviewIdx];
    const isCorrect = userAnswer === q.correct;

    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setReviewMode(false)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Результати
          </button>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Питання {reviewIdx + 1} / {questions.length}</span>
            {isCorrect
              ? <span className="flex items-center gap-1 text-sm text-accent-green"><CheckCircle className="w-4 h-4" /> Правильно</span>
              : <span className="flex items-center gap-1 text-sm text-red-400"><XCircle className="w-4 h-4" /> Неправильно</span>
            }
          </div>
          <p className="text-white font-medium text-lg mb-5 leading-snug">{q.question}</p>

          <div className="space-y-2 mb-4">
            {q.options.map((opt, i) => {
              let cls = 'border-navy-600 bg-navy-700/50 text-gray-400';
              if (i === q.correct) cls = 'border-accent-green bg-accent-green/10 text-accent-green';
              else if (i === userAnswer && !isCorrect) cls = 'border-red-500 bg-red-500/10 text-red-400';
              return (
                <div key={i} className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-3 ${cls}`}>
                  <span className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 border-current">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {i === q.correct && <CheckCircle className="w-4 h-4 ml-auto shrink-0" />}
                  {i === userAnswer && !isCorrect && <XCircle className="w-4 h-4 ml-auto shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="bg-navy-700/50 border border-navy-600 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300">{q.explanation}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setReviewIdx(i => Math.max(0, i - 1))}
            disabled={reviewIdx === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-800 border border-navy-700 rounded-xl text-gray-300 hover:text-white hover:border-navy-500 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Попереднє
          </button>
          <div className="flex-1" />
          {reviewIdx < questions.length - 1 ? (
            <button
              onClick={() => setReviewIdx(i => i + 1)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all text-sm font-medium"
            >
              Наступне
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setReviewMode(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-green text-navy-900 rounded-xl hover:opacity-90 transition-all text-sm font-semibold"
            >
              Закрити перегляд
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz taking view
  const q: QuizQuestion = questions[currentQ];
  const isAnswered = selected !== null;
  const isCorrect = selected === q.correct;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    setShowExplanation(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(i => i + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const progress = ((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до курсу
        </Link>
      </div>

      {/* Quiz header */}
      <div
        className="rounded-2xl p-5 mb-6 border"
        style={{
          background: `linear-gradient(135deg, ${levelColor}10, ${levelColor}05)`,
          borderColor: `${levelColor}30`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{quiz.title}</h1>
            <p className="text-sm text-gray-400">{questions.length} питань — самоперевірка</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span>Прогрес: {currentQ + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: levelColor }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-3 mb-6">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
          >
            {currentQ + 1}
          </span>
          <p className="text-white font-medium text-base leading-snug pt-0.5">{q.question}</p>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let cls = 'border-navy-600 bg-navy-700/50 text-gray-300 hover:border-navy-500 hover:bg-navy-700 cursor-pointer';
            if (isAnswered) {
              if (i === q.correct) cls = 'border-accent-green bg-accent-green/10 text-accent-green cursor-default';
              else if (i === selected) cls = 'border-red-500 bg-red-500/10 text-red-400 cursor-default';
              else cls = 'border-navy-600 bg-navy-700/30 text-gray-500 cursor-default opacity-60';
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={isAnswered}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center gap-3 transition-all ${cls}`}
              >
                <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
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
        {showExplanation && (
          <div
            className={`mt-4 border rounded-xl px-4 py-3 flex items-start gap-2 ${
              isCorrect ? 'border-accent-green/30 bg-accent-green/10' : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            {isCorrect
              ? <CheckCircle className="w-4 h-4 text-accent-green mt-0.5 shrink-0" />
              : <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            }
            <div>
              <p className={`text-sm font-semibold mb-0.5 ${isCorrect ? 'text-accent-green' : 'text-red-400'}`}>
                {isCorrect ? 'Правильно!' : 'Неправильно'}
              </p>
              <p className="text-sm text-gray-300">{q.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < currentQ
                  ? answers[i] === questions[i].correct ? 'bg-accent-green' : 'bg-red-400'
                  : i === currentQ ? 'bg-primary-400' : 'bg-navy-600'
              }`}
            />
          ))}
        </div>
        {isAnswered && (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-medium text-sm"
          >
            {currentQ < questions.length - 1 ? 'Наступне' : 'Завершити'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
