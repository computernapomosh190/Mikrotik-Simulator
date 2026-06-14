import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
  userName: string;
  courseName: string;
  courseLevel: number;
  certificateNumber: string;
  issueDate: string;
  verificationCode: string;
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MTK-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MTCNA-${timestamp}-${random}`;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 20;

  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, pageWidth, 10, 'F');
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

  doc.setFillColor(27, 38, 59);
  doc.rect(0, 10, pageWidth, 5, 'F');
  doc.rect(0, pageHeight - 15, pageWidth, 5, 'F');

  doc.setDrawColor(46, 134, 222);
  doc.setLineWidth(0.5);
  doc.rect(margin - 5, 20, pageWidth - margin * 2 + 10, pageHeight - 40);

  doc.setFontSize(32);
  doc.setTextColor(46, 134, 222);
  doc.text('MIKROTIK', pageWidth / 2, 50, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(229, 229, 229);
  doc.text('Certified Network Administrator', pageWidth / 2, 62, { align: 'center' });

  doc.setDrawColor(46, 134, 222);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 40, 68, pageWidth / 2 + 40, 68);

  doc.setFontSize(14);
  doc.setTextColor(168, 168, 168);
  doc.text('This is to certify that', pageWidth / 2, 85, { align: 'center' });

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(data.userName, pageWidth / 2, 100, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(168, 168, 168);
  doc.text('has successfully completed the', pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(16, 172, 132);
  doc.text(data.courseName, pageWidth / 2, 130, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(168, 168, 168);
  doc.text('Level ' + data.courseLevel + ' Certification', pageWidth / 2, 142, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(168, 168, 168);
  doc.text(`Issue Date: ${data.issueDate}`, margin + 10, pageHeight - 35);
  doc.text(`Certificate No: ${data.certificateNumber}`, margin + 10, pageHeight - 28);

  doc.text(`Verification: ${data.verificationCode}`, pageWidth - margin - 60, pageHeight - 35);

  const qrData = `${window.location.origin}/verify/${data.verificationCode}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0D1B2A',
        light: '#FFFFFF',
      },
    });

    doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 35, pageHeight - 60, 30, 30);
  } catch (err) {
    console.error('Error generating QR code:', err);
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Scan to verify authenticity', pageWidth - margin - 35, pageHeight - 25);

  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

export function downloadCertificate(data: CertificateData): void {
  generateCertificatePDF(data).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MikroTik_Certificate_${data.userName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

export { generateVerificationCode, generateCertificateNumber };
export type { CertificateData };
