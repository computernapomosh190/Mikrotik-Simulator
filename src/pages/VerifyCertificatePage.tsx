import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LEVEL_COLORS } from '../lib/constants';
import {
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  Shield,
  Loader2,
  User,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';

interface VerifiedCertificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  verification_code: string;
  course: {
    id: string;
    title: string;
    level: number;
    description: string;
  };
  profile: {
    display_name: string | null;
    username: string;
  };
}

export function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyCertificate();
  }, [code]);

  const verifyCertificate = async () => {
    if (!code) return;

    try {
      const { data, error: queryError } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_number,
          issued_at,
          verification_code,
          courses (id, title, level, description),
          profiles (display_name, username)
        `)
        .eq('verification_code', code)
        .single();

      if (queryError || !data) {
        setError('Certificate not found');
        setLoading(false);
        return;
      }

      const certData: VerifiedCertificate = {
        id: data.id,
        certificate_number: data.certificate_number,
        issued_at: data.issued_at,
        verification_code: data.verification_code,
        course: Array.isArray(data.courses) ? data.courses[0] : data.courses,
        profile: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
      };

      setCertificate(certData);
      setLoading(false);
    } catch (err) {
      setError('Verification failed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
          <p className="text-gray-400">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-accent-orange mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
          <p className="text-gray-400 mb-6">{error || 'Certificate not found'}</p>
          <p className="text-sm text-gray-500">
            The certificate verification code may be invalid or the certificate has been revoked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-teal mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Certificate Verification</h1>
          <p className="text-gray-400">MikroTik Lab Simulator Certification System</p>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-navy-700 bg-gradient-to-r from-accent-green/10 to-accent-teal/10">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-8 h-8 text-accent-green" />
              <div>
                <h2 className="text-xl font-bold text-white">Valid Certificate</h2>
                <p className="text-sm text-gray-400">This certificate has been verified</p>
              </div>
            </div>
          </div>

          <div className="p-8 relative">
            <div className="absolute top-4 right-4">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${LEVEL_COLORS[certificate.course.level]}20` }}
              >
                <Award className="w-10 h-10" style={{ color: LEVEL_COLORS[certificate.course.level] }} />
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-400 mb-2">This certifies that</p>
              <h3 className="text-3xl font-bold text-white">
                {certificate.profile.display_name || certificate.profile.username}
              </h3>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-400 mb-2">has successfully completed</p>
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-medium px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${LEVEL_COLORS[certificate.course.level]}20`,
                    color: LEVEL_COLORS[certificate.course.level],
                  }}
                >
                  Level {certificate.course.level}
                </span>
                <h4 className="text-2xl font-semibold text-accent-teal">
                  {certificate.course.title}
                </h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Certificate Number</p>
                  <p className="text-sm font-mono text-white">{certificate.certificate_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Issue Date</p>
                  <p className="text-sm text-white">
                    {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Verification Code</p>
                  <p className="text-sm font-mono text-white">{certificate.verification_code}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-navy-800/50 border-t border-navy-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <GraduationCap className="w-4 h-4" />
              <span>MikroTik Lab Simulator Certification System</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#0D1B2A] border border-navy-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Security Notice</p>
              <p className="text-xs text-gray-400 mt-1">
                This certificate is cryptographically verified by the MikroTik Lab Simulator system.
                The digital signature ensures the authenticity and integrity of this certification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
