export interface Project {
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

export interface ProjectDocument {
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

export interface DocumentListProps {
  documents: ProjectDocument[];
  onDelete: () => void;
}

export interface DocumentUploadProps {
  projectId: string;
  isOpen: boolean;
  onUploadComplete: () => void;
  onCancel: () => void;
}
