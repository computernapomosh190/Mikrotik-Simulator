import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Certificate, Course } from '../types';
import { LEVEL_COLORS } from '../lib/constants';
import { downloadCertificate, generateCertificateNumber, generateVerificationCode } from '../lib/certificate';
import {
  Award,
  Download,
  ExternalLink,
  Loader2,
  FileText,
  CheckCircle,
  Star,
} from 'lucide-react';

interface CertificateWithCourse extends Certificate {
  courses?: Course;
}

export function CertificatesPage() {
  const { profile } = useAuth();
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    loadCertificates();
  }, [profile]);

  const loadCertificates = async () => {
    if (!profile) { setLoading(false); return; }

    try {
      const [certRes, coursesRes] = await Promise.all([
        supabase
          .from('certificates')
          .select('*, courses(*)')
          .eq('user_id', profile.id)
          .order('issued_at', { ascending: false }),
        supabase.from('courses').select('*').order('order_index'),
      ]);

      if (certRes.data) setCertificates(certRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setLoading(false);
    }
  };

  const handleDownload = async (cert: CertificateWithCourse) => {
    if (!profile || !cert.courses) return;

    setGenerating(cert.id);

    try {
      downloadCertificate({
        userName: profile.displayName || profile.username,
        courseName: cert.courses.title,
        courseLevel: cert.courses.level,
        certificateNumber: cert.certificate_number,
        issueDate: new Date(cert.issued_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        verificationCode: cert.verification_code,
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setGenerating(null);
    }
  };

  const canGenerateCertificate = async (courseId: string): Promise<boolean> => {
    if (!profile) return false;

    const { data: labs } = await supabase
      .from('labs')
      .select('id')
      .eq('course_id', courseId);

    if (!labs || labs.length === 0) return false;

    const { count: completedCount } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('status', 'completed')
      .in('lab_id', labs.map(l => l.id));

    return completedCount === labs.length;
  };

  const handleGenerateCertificate = async (course: Course) => {
    if (!profile) return;

    if (!canGenerateCertificate(course.id)) {
      return;
    }

    try {
      const certNumber = generateCertificateNumber();
      const verifCode = generateVerificationCode();

      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: profile.id,
          course_id: course.id,
          certificate_number: certNumber,
          verification_code: verifCode,
          digital_signature: `sig_${Date.now()}_${profile.id}`,
        })
        .select('*, courses(*)')
        .single();

      if (!error && data) {
        setCertificates(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-navy-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-navy-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const availableCourses = courses.filter(
    course => !certificates.some(c => c.course_id === course.id)
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Certificates</h1>
        <p className="text-gray-400">Your earned MikroTik certifications</p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {certificates.map((cert) => {
            const course = cert.courses;
            if (!course) return null;

            return (
              <div
                key={cert.id}
                className="card-hover p-6 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10"
                  style={{
                    background: `radial-gradient(circle at top right, ${LEVEL_COLORS[course.level]}, transparent 70%)`,
                  }}
                />

                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${LEVEL_COLORS[course.level]}20` }}
                  >
                    <Award className="w-8 h-8" style={{ color: LEVEL_COLORS[course.level] }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${LEVEL_COLORS[course.level]}20`,
                          color: LEVEL_COLORS[course.level],
                        }}
                      >
                        Level {course.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Issued: {new Date(cert.issued_at).toLocaleDateString()}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1 px-2 py-1 bg-navy-700/50 rounded text-xs">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 font-mono">{cert.verification_code}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(cert)}
                        disabled={generating === cert.id}
                        className="btn-primary gap-2 text-sm"
                      >
                        {generating === cert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download PDF
                      </button>
                      <Link
                        to={`/verify/${cert.verification_code}`}
                        className="btn-ghost gap-2 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Verify
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center mb-8">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h2>
          <p className="text-gray-400 mb-4">
            Complete all labs in a course to earn your certification
          </p>
          <Link to="/courses" className="btn-primary">
            View Courses
          </Link>
        </div>
      )}

      <h2 className="text-lg font-semibold text-white mb-4">Available Certifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableCourses.map((course) => (
          <div key={course.id} className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${LEVEL_COLORS[course.level]}20` }}
              >
                <span className="text-lg font-bold" style={{ color: LEVEL_COLORS[course.level] }}>
                  {course.level}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-white">{course.title}</h3>
                <p className="text-xs text-gray-400">Level {course.level}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">{course.description}</p>
            <Link
              to={`/courses/${course.id}`}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View Course →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-[#0D1B2A] border border-navy-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent-green" />
          Certificate Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-primary-400" />
            <div>
              <p className="text-sm font-medium text-white">PDF Export</p>
              <p className="text-xs text-gray-400">Download high-quality PDF certificate</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Award className="w-5 h-5 text-accent-teal" />
            <div>
              <p className="text-sm font-medium text-white">QR Verification</p>
              <p className="text-xs text-gray-400">Each certificate has unique verification code</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Star className="w-5 h-5 text-accent-orange" />
            <div>
              <p className="text-sm font-medium text-white">MTCNA Style</p>
              <p className="text-xs text-gray-400">Professional MikroTik certification design</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
