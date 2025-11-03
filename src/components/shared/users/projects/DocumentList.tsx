import { Download, Trash2, FileText, File } from 'lucide-react';
// import { ProjectDocument, supabase } from '@/lib/supabase';

// Temporary type definition
interface ProjectDocument {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

interface DocumentListProps {
  documents: ProjectDocument[];
  onDelete: () => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      onDelete();
    } catch (error) {
      alert('Failed to delete document' + error);
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (['pdf'].includes(type)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-red-600" />
        </div>
      );
    } else if (['doc', 'docx'].includes(type)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
      );
    } else if (['xls', 'xlsx'].includes(type)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-green-600" />
        </div>
      );
    } else if (['ppt', 'pptx'].includes(type)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-orange-600" />
        </div>
      );
    } else if (['zip', 'rar', '7z'].includes(type)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <File className="w-4 h-4 text-purple-600" />
        </div>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(type)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-pink-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
        <File className="w-4 h-4 text-slate-600" />
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 mb-3">
          <FileText className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          No documents yet
        </h3>
        <p className="text-xs text-slate-500">
          Upload your first document to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div
          key={doc.id}
          className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-200 hover:shadow-sm"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getFileIcon(doc.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 truncate mb-1 group-hover:text-blue-900 transition-colors">
                  {doc.title}
                </h4>
                {doc.description && (
                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                    {doc.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                    {doc.file_type.toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {formatFileSize(doc.file_size)}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {formatDate(doc.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 sm:hidden">
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-all duration-200 text-xs font-medium border border-blue-200 hover:border-blue-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
              <button
                onClick={() => handleDelete()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200 text-xs font-medium border border-red-200 hover:border-red-300"
                title="Delete document"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
