import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmitterAuth } from '../../context/submitterAuthContext';
import { usecongress } from '../../context/congressContext';

const PRESENTATION_LABELS = {
  oral_inperson: 'Oral Presentation (In-Person)',
  oral_virtual: 'Oral Presentation (Virtual)',
  poster_inperson: 'Poster Presentation (In-Person)',
  poster_virtual: 'Poster Presentation (Virtual)',
};

export default function AcceptanceLetter() {
  const { submitter, loading } = useSubmitterAuth();
  const { siteSettings, activeEdition } = usecongress();
  const navigate = useNavigate();

  const siteName = siteSettings?.siteName || 'Aging Congress';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const letterRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  /**
   * Rasterises the letter and lays it into an A4 PDF, splitting across pages
   * when it runs long. Loaded on demand so the PDF libraries stay out of the
   * main bundle.
   */
  const handleSavePdf = async () => {
    if (!letterRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(letterRef.current, {
        scale: 2,              // sharper text
        backgroundColor: '#ffffff',
        useCORS: true,         // let the logo through if it is remote
        logging: false,
        onclone: (doc) => {
          // html2canvas can't rasterise border-image or clip-path, so swap them
          // for plain equivalents in the throwaway clone it renders from
          doc.querySelectorAll('*').forEach((el) => {
            const cs = doc.defaultView.getComputedStyle(el);
            if (cs.borderImageSource && cs.borderImageSource !== 'none') {
              el.style.borderImage = 'none';
              el.style.borderBottomColor = cs.borderBottomColor || '#0f766e';
            }
            if (cs.clipPath && cs.clipPath !== 'none') el.style.clipPath = 'none';
          });
        },
      });

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgW = pageW - margin * 2;
      const imgH = (canvas.height * imgW) / canvas.width;
      const img = canvas.toDataURL('image/jpeg', 0.95);

      if (imgH <= pageH - margin * 2) {
        pdf.addImage(img, 'JPEG', margin, margin, imgW, imgH);
      } else {
        // Taller than one page: shift the same image up per page and clip
        const usableH = pageH - margin * 2;
        let remaining = imgH;
        let offset = 0;
        while (remaining > 0) {
          pdf.addImage(img, 'JPEG', margin, margin - offset, imgW, imgH);
          remaining -= usableH;
          offset += usableH;
          if (remaining > 0) pdf.addPage();
        }
      }

      pdf.save(`Letter-of-Acceptance-${submitter?.loginId || 'abstract'}.pdf`);
    } catch {
      toast.error('Could not build the PDF. Try the Print button and choose "Save as PDF".');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!loading && !submitter) navigate('/portal/login', { replace: true });
    if (!loading && submitter && submitter.status !== 'accepted') navigate('/portal/dashboard', { replace: true });
  }, [submitter, loading, navigate]);

  if (loading || !submitter) return null;

  const s = submitter;

  return (
    <div>
      {/* Actions bar (hidden on print) */}
      <div className="no-print" style={{
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
        padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link
          to="/portal/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', fontSize: 13, fontWeight: 700,
            background: '#fff', color: 'var(--brand-dark)',
            border: '1.5px solid var(--brand)', borderRadius: 8, cursor: 'pointer',
          }}
        >
          <Printer size={14} /> Print
        </button>
        <button
          onClick={handleSavePdf}
          disabled={exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
            color: '#fff', border: 'none', borderRadius: 8,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting
            ? <><Loader2 size={14} className="animate-spin" /> Preparing…</>
            : <><Download size={14} /> Save as PDF</>}
        </button>
      </div>

      {/* Letter */}
      <div style={{ maxWidth: 740, margin: '32px auto', padding: '0 24px' }}>
        <div ref={letterRef} style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {/* Letterhead */}
          <div style={{
            padding: '32px 48px 24px',
            borderBottom: '3px solid',
            borderImage: 'linear-gradient(90deg, var(--brand-dark), var(--brand)) 1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {siteSettings?.logo ? (
                <img src={siteSettings.logo} alt={siteName} style={{ width: 52, height: 52, objectFit: 'contain' }} />
              ) : (
                <div style={{
                  width: 52, height: 52,
                  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>AC</span>
                </div>
              )}
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {siteName}
                </div>
                {activeEdition && (
                  <div style={{ fontSize: 11, color: 'var(--brand)', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase', marginTop: 3 }}>
                    {activeEdition.title} · {activeEdition.year}
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Date of Issue
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginTop: 2 }}>{today}</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '40px 48px' }}>
            <div style={{
              textAlign: 'center',
              marginBottom: 36,
              paddingBottom: 24,
              borderBottom: '1px solid #f1f5f9',
            }}>
              <h1 style={{
                fontSize: 20, fontWeight: 900, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#0f172a',
                margin: '0 0 6px',
              }}>
                Letter of Acceptance
              </h1>
              <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, var(--brand-dark), var(--brand))', margin: '0 auto' }} />
            </div>

            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: '0 0 16px' }}>
              Dear <strong>{s.firstName} {s.lastName}</strong>,
            </p>

            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: '0 0 16px' }}>
              We are delighted to inform you that your abstract submission has been reviewed by our Scientific Committee and has been <strong style={{ color: '#15803d' }}>accepted</strong> for presentation at the <strong>{siteName}</strong>{activeEdition ? ` (${activeEdition.year} Edition)` : ''}.
            </p>

            {/* Abstract Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid var(--brand)',
              borderRadius: '0 8px 8px 0',
              padding: '20px 24px',
              margin: '24px 0',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Accepted Abstract
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '5px 16px 5px 0', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>Title</td>
                    <td style={{ padding: '5px 0', fontSize: 13, color: '#1e293b', fontWeight: 700, lineHeight: 1.4 }}>{s.abstractTitle}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 16px 5px 0', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Author</td>
                    <td style={{ padding: '5px 0', fontSize: 13, color: '#1e293b' }}>{s.firstName} {s.lastName}</td>
                  </tr>
                  {s.organization && (
                    <tr>
                      <td style={{ padding: '5px 16px 5px 0', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Institution</td>
                      <td style={{ padding: '5px 0', fontSize: 13, color: '#1e293b' }}>{s.organization}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '5px 16px 5px 0', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Type</td>
                    <td style={{ padding: '5px 0', fontSize: 13, color: '#1e293b' }}>{PRESENTATION_LABELS[s.presentationType] || s.presentationType}</td>
                  </tr>
                  {s.topic?.title && (
                    <tr>
                      <td style={{ padding: '5px 16px 5px 0', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Topic</td>
                      <td style={{ padding: '5px 0', fontSize: 13, color: '#1e293b' }}>{s.topic.title}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '5px 16px 5px 0', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Reference</td>
                    <td style={{ padding: '5px 0', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{s.loginId}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: '0 0 16px' }}>
              Please complete your conference registration at your earliest convenience to confirm your participation and secure your slot. Early registration is recommended as space is limited.
            </p>

            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: '0 0 32px' }}>
              We look forward to your valuable contribution to the congress. Should you have any questions, please do not hesitate to contact us.
            </p>

            {/* Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
              <div>
                <div style={{ marginBottom: 32, fontSize: 13, color: '#374151' }}>Sincerely,</div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 6, width: 180 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Scientific Committee</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{siteName}</div>
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end',
              }}>
                <div style={{
                  border: '1px dashed #e2e8f0',
                  borderRadius: 8, padding: '10px 16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Reference No.
                  </div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-dark)' }}>
                    {s.loginId}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="no-print" style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
          "Save as PDF" downloads the letter to your device. <Link to="/portal/dashboard" style={{ color: 'var(--brand)' }}>Back to Dashboard →</Link>
        </p>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
