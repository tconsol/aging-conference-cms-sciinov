import { useState, useEffect } from 'react';
import { Upload, File, X } from 'lucide-react';

export default function FileUpload({
  label,
  name,
  register,
  watch,
  error,
  accept = '.pdf,.doc,.docx',
  currentFile,
  required,
}) {
  const [fileName, setFileName] = useState('');
  const watched = watch ? watch(name) : null;

  useEffect(() => {
    if (watched instanceof FileList && watched[0]) {
      setFileName(watched[0].name);
    } else if (watched instanceof File) {
      setFileName(watched.name);
    }
  }, [watched]);

  const inputProps = register ? register(name, { required }) : {};

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <label className="cursor-pointer group">
        <input type="file" accept={accept} className="hidden" {...inputProps} />
        <div className="flex items-center gap-3 h-10 px-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 group-hover:border-blue-400 transition-colors">
          <File size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-500 flex-1 truncate">
            {fileName || currentFile || 'Click to select file'}
          </span>
          <Upload size={14} className="text-slate-400 flex-shrink-0" />
        </div>
      </label>
      {currentFile && !fileName && (
        <a href={currentFile} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
          View current file
        </a>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
