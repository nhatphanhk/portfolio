import { BlogPost } from '@/types/BlogData';

/**
 * API Service for Blog Operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const blogApi = {
  /**
   * Fetch all blog posts
   */
  async getAll(): Promise<BlogPost[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        cache: 'no-store', // or 'force-cache' depending on your needs
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },

  /**
   * Fetch a single blog post by slug
   */
  async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch blog post');
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching blog post with slug ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Create a new blog post (Admin)
   */
  async create(data: Omit<BlogPost, 'slug'>): Promise<BlogPost> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  },

  /**
   * Update an existing blog post (Admin)
   */
  async update(slug: string, data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }

      return response.json();
    } catch (error) {
      console.error(`Error updating blog post ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Delete a blog post (Admin)
   */
  async delete(slug: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }
    } catch (error) {
      console.error(`Error deleting blog post ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Search blog posts
   */
  async search(query: string): Promise<BlogPost[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/blogs/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search blog posts');
      }

      return response.json();
    } catch (error) {
      console.error('Error searching blog posts:', error);
      throw error;
    }
  },
};
