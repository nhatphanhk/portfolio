'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Upload,
  ExternalLink,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Github,
} from 'lucide-react';

// Temporary type definitions
interface Project {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  category: string;
  status: 'planning' | 'in-progress' | 'completed';
  image_url: string;
  demo_url?: string;
  github_url?: string;
  project_url?: string;
  technologies: string[];
  start_date: string | null;
  end_date: string | null;
  team_size: number;
  client_name?: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

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
import { DocumentUpload } from '@/components/shared/users/projects/DocumentUpload';
import { DocumentList } from '@/components/shared/users/projects/DocumentList';
import MainLayout from '@/components/MainLayout';

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const loadProjectDetails = useCallback(async () => {
    try {
      // TODO: Implement actual data loading
      // Mock project data for now
      const mockProject: Project = {
        id: id,
        title: 'Sample Project',
        description: 'This is a sample project description',
        detailed_description:
          'This is a detailed description of the sample project.',
        category: 'Web Development',
        status: 'in-progress',
        image_url: 'https://via.placeholder.com/800x400',
        demo_url: '#',
        github_url: '#',
        project_url: '#',
        technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        team_size: 3,
        client_name: 'Sample Client',
        featured: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      setProject(mockProject);
    } catch (error) {
      alert('Error loading project: ' + error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadDocuments = useCallback(async () => {
    try {
      // TODO: Implement actual document loading
      // Mock documents for now
      const mockDocuments: ProjectDocument[] = [
        {
          id: '1',
          project_id: id,
          title: 'Project Requirements',
          description: 'Initial project requirements document',
          file_url: '#',
          file_type: 'pdf',
          file_size: 1024000,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          project_id: id,
          title: 'Design Mockups',
          description: 'UI/UX design mockups',
          file_url: '#',
          file_type: 'zip',
          file_size: 2048000,
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
        },
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      alert('Error loading documents: ' + error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProjectDetails();
      loadDocuments();
    }
  }, [id, loadProjectDetails, loadDocuments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'planning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'planning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Project Not Found
          </h2>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Main Project Content */}
      <div className="col-span-1 lg:col-span-8">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="relative h-64 sm:h-80 bg-slate-100">
            {/* <Image
              src={project.image_url}
              alt={project.title}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            /> */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            {project.featured && (
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-500 text-white shadow-lg backdrop-blur-sm">
                  Featured Project
                </span>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {project.category}
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(project.status)}`}
              >
                {getStatusIcon(project.status)}
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Start Date
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {formatDate(project.start_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    End Date
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {formatDate(project.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors sm:col-span-2 lg:col-span-1">
                <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Team Size
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {project.team_size}{' '}
                    {project.team_size === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
            </div>

            {project.client_name && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-1">Client</p>
                <p className="text-lg text-blue-900 font-semibold">
                  {project.client_name}
                </p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-blue-150 transition-all duration-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Demo
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all duration-200 font-medium"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 border border-slate-300 font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  Project Link
                </a>
              )}
            </div>

            {project.detailed_description && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  About This Project
                </h2>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {project.detailed_description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Project Documents */}
      <div className="col-span-1 lg:col-span-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:sticky lg:top-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Documents</h2>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>

          {showUpload && (
            <DocumentUpload
              projectId={project.id}
              isOpen={showUpload}
              onUploadComplete={() => {
                loadDocuments();
                setShowUpload(false);
              }}
              onCancel={() => setShowUpload(false)}
            />
          )}

          {documents.length === 0 && !showUpload ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">
                No documents uploaded yet
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Upload project documents to get started
              </p>
            </div>
          ) : (
            <DocumentList documents={documents} onDelete={loadDocuments} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
