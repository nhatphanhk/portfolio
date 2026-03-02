import { useState, useEffect } from 'react';
import { Upload, X, FileText } from 'lucide-react';
// import { supabase } from '@/lib/supabase';
import { DocumentUploadProps } from '@/types/Project';

export function DocumentUpload({
  isOpen,
  onUploadComplete,
  onCancel,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [completedUploads, setCompletedUploads] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setTitle('');
      setDescription('');
      setError('');
      setWarning('');
      setUploading(false);
      setUploadProgress({});
      setCompletedUploads([]);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !uploading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, uploading, onCancel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    setError('');
    setWarning('');

    const validFiles: File[] = [];
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    const warningSize = 10 * 1024 * 1024; // 10MB in bytes
    let hasLargeFiles = false;
    newFiles.forEach(file => {
      // Check for duplicates
      const isDuplicate = files.some(
        existingFile =>
          existingFile.name === file.name && existingFile.size === file.size
      );

      if (isDuplicate) {
        return; // Skip duplicate files
      }

      if (file.size > maxSize) {
        setError(
          prev =>
            prev +
            (prev ? '\n' : '') +
            `File "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the maximum limit of 100MB.`
        );
        return;
      }

      if (file.size > warningSize) {
        hasLargeFiles = true;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);

      // Auto-fill title if empty and only one file selected
      if (!title && validFiles.length === 1 && files.length === 0) {
        const nameWithoutExtension = validFiles[0].name.replace(
          /\.[^/.]+$/,
          ''
        );
        setTitle(nameWithoutExtension);
      }

      if (hasLargeFiles) {
        setWarning(
          `${validFiles.filter(f => f.size > warningSize).length} large file(s) detected. Upload may take longer than usual.`
        );
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (uploading) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const removeFile = (index: number) => {
    if (uploading) return;
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateFileUpload = (file: File, fileId: string) => {
    return new Promise<void>(resolve => {
      let progress = 0;
      const increment = Math.random() * 10 + 5; // Random increment between 5-15%

      const updateProgress = () => {
        progress += increment;

        if (progress >= 100) {
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          setCompletedUploads(prev => [...prev, fileId]);
          setTimeout(resolve, 300); // Small delay to show 100%
        } else {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: Math.min(progress, 95),
          }));
          const delay = file.size > 10 * 1024 * 1024 ? 500 : 200; // Slower for large files
          setTimeout(updateProgress, delay);
        }
      };

      updateProgress();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a document title');
      return;
    }

    setUploading(true);
    setUploadProgress({});
    setCompletedUploads([]);

    try {
      // Upload files concurrently
      const uploadPromises = files.map((file, index) => {
        const fileId = `${file.name}-${index}`;
        return simulateFileUpload(file, fileId);
      });

      // TODO: Implement actual file upload logic with real progress tracking
      await Promise.all(uploadPromises);

      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to upload one or more documents');
    } finally {
      setUploading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !uploading) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 "
      onClick={handleBackdropClick}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Upload New Document
            </h3>
            <button
              onClick={onCancel}
              disabled={uploading}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Document Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                required
                disabled={uploading}
              />
            </div>

            {/* Document Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter document description (optional)"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors text-sm"
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Zone */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Files *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-modal"
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.tar,.gz"
                    multiple
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload-modal"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`flex items-center justify-center w-full h-40 px-4 py-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
                      uploading
                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                        : isDragActive
                          ? 'border-blue-500 bg-blue-100 scale-[1.02] shadow-lg'
                          : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-center">
                      <Upload
                        className={`w-10 h-10 mx-auto mb-3 transition-colors ${
                          isDragActive ? 'text-blue-500' : 'text-slate-400'
                        }`}
                      />
                      <p
                        className={`text-sm font-medium mb-2 transition-colors ${
                          isDragActive ? 'text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {files.length === 0
                          ? isDragActive
                            ? 'Drop your files here'
                            : 'Click to upload or drag and drop'
                          : isDragActive
                            ? 'Drop more files here'
                            : 'Click to add more files'}
                      </p>
                      <p className="text-xs text-slate-500 mb-1">
                        PDF, DOC, TXT, XLS, PPT, ZIP, TAR, GZ (Max 100MB)
                      </p>
                      <p className="text-xs text-slate-400">
                        {files.length === 0
                          ? 'Large files supported with progress tracking'
                          : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* File List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Selected Files
                  </label>
                  {files.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {files.length} file{files.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {files.length === 0 ? (
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        No files selected
                      </p>
                      <p className="text-xs text-slate-400">
                        Files will appear here after selection
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <div className="space-y-2">
                      {files.map((file, index) => {
                        const fileId = `${file.name}-${index}`;
                        const progress = uploadProgress[fileId] || 0;
                        const isCompleted = completedUploads.includes(fileId);

                        return (
                          <div
                            key={fileId}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : uploading && progress > 0
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isCompleted
                                    ? 'bg-green-100'
                                    : uploading && progress > 0
                                      ? 'bg-blue-100'
                                      : 'bg-slate-100'
                                }`}
                              >
                                <FileText
                                  className={`w-4 h-4 ${
                                    isCompleted
                                      ? 'text-green-600'
                                      : uploading && progress > 0
                                        ? 'text-blue-600'
                                        : 'text-slate-600'
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <span>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                  {file.size > 10 * 1024 * 1024 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
                                      Large
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {uploading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-blue-100 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-blue-600 w-7 text-right font-medium">
                                  {progress.toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {warning && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">{warning}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {uploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-800 font-medium">
                    Uploading "{title}" with {files.length} file
                    {files.length > 1 ? 's' : ''}...
                  </p>
                  <span className="text-xs text-blue-600">
                    {completedUploads.length}/{files.length} completed
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${(completedUploads.length / files.length) * 100}%`,
                    }}
                  ></div>
                </div>
                {files.some(f => f.size > 10 * 1024 * 1024) && (
                  <p className="text-xs text-blue-600">
                    Large file upload in progress. Please don't close this
                    window.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading || !!error || files.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {files.some(f => f.size > 10 * 1024 * 1024)
                      ? `Uploading Documents... ${completedUploads.length}/${files.length}`
                      : `Uploading... ${completedUploads.length}/${files.length}`}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {files.length === 0
                      ? 'Upload Documents'
                      : files.some(f => f.size > 10 * 1024 * 1024)
                        ? `Upload ${files.length} Document${files.length > 1 ? 's' : ''} (Large)`
                        : `Upload ${files.length} Document${files.length > 1 ? 's' : ''}`}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={uploading}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 text-sm font-medium border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Please Wait...' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
