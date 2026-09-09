import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FileDown, Upload, Trash2, Loader2 } from 'lucide-react';
import { siteSettingsAPI } from '../../api/settings';
import { getErrorMessage } from '../../utils/helpers';

/**
 * Upload/replace the sample abstract template that the public submission page
 * offers as a download. Stored on SiteSettings, so there is exactly one.
 */
export default function SampleAbstractPanel() {
  const [sample, setSample] = useState({ url: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    try {
      const res = await siteSettingsAPI.get();
      const s = res.data?.data || res.data || {};
      setSample({ url: s.sampleAbstractUrl || '', name: s.sampleAbstractName || '' });
    } catch {
      // A settings read failure should not blank out the abstracts page it sits on.
      setSample({ url: '', name: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    // Reset immediately so re-picking the same filename still fires onChange.
    e.target.value = '';
    if (!file) return;

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('sampleAbstract', file);
      const res = await siteSettingsAPI.uploadSampleAbstract(fd);
      const s = res.data?.data || {};
      setSample({ url: s.sampleAbstractUrl || '', name: s.sampleAbstractName || '' });
      setConfirmRemove(false);
      toast.success('Sample abstract uploaded.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await siteSettingsAPI.deleteSampleAbstract();
      setSample({ url: '', name: '' });
      setConfirmRemove(false);
      toast.success('Sample abstract removed.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <FileDown size={18} className="text-teal-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Sample Abstract Template</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Offered as a download button on the public abstract submission page. PDF, DOC or DOCX.
            </p>

            {loading ? (
              <p className="text-xs text-slate-400 mt-2">Loading…</p>
            ) : sample.url ? (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <a
                  href={sample.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline break-all"
                >
                  {sample.name || 'Current file'}
                </a>
                {!confirmRemove ? (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    disabled={busy}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xs text-slate-600">Remove this file?</span>
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={busy}
                      className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Yes, remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(false)}
                      disabled={busy}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                    >
                      Cancel
                    </button>
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-amber-700 mt-2">
                No template uploaded — the download button is hidden on the public page.
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 transition-colors"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {sample.url ? 'Replace File' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
}
