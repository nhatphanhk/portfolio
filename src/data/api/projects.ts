import { Project, ProjectFormData } from '@/types/Project';

/**
 * API Service for Project Operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const projectApi = {
  /**
   * Fetch all projects
   */
  async getAll(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Fetch featured projects
   */
  async getFeatured(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/featured`);

      if (!response.ok) {
        throw new Error('Failed to fetch featured projects');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      throw error;
    }
  },

  /**
   * Fetch a single project by slug
   */
  async getBySlug(slug: string): Promise<Project | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch project');
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching project with slug ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Create a new project (Admin)
   */
  async create(data: ProjectFormData): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update an existing project (Admin)
   */
  async update(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      return response.json();
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a project (Admin)
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },
};
