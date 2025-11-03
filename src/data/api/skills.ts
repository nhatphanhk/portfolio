import { Skill, SkillFormData, SkillGroup } from '@/types/Skill';

/**
 * API Service for Skill Operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const skillApi = {
  /**
   * Fetch all skills
   */
  async getAll(): Promise<Skill[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/skills`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },

  /**
   * Fetch skills grouped by category
   */
  async getGrouped(): Promise<SkillGroup[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/skills/grouped`);

      if (!response.ok) {
        throw new Error('Failed to fetch grouped skills');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching grouped skills:', error);
      throw error;
    }
  },

  /**
   * Fetch featured skills
   */
  async getFeatured(): Promise<Skill[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/skills/featured`);

      if (!response.ok) {
        throw new Error('Failed to fetch featured skills');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching featured skills:', error);
      throw error;
    }
  },

  /**
   * Create a new skill (Admin)
   */
  async create(data: SkillFormData): Promise<Skill> {
    try {
      const response = await fetch(`${API_BASE_URL}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create skill');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },

  /**
   * Update an existing skill (Admin)
   */
  async update(id: string, data: Partial<SkillFormData>): Promise<Skill> {
    try {
      const response = await fetch(`${API_BASE_URL}/skills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update skill');
      }

      return response.json();
    } catch (error) {
      console.error(`Error updating skill ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a skill (Admin)
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/skills/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete skill');
      }
    } catch (error) {
      console.error(`Error deleting skill ${id}:`, error);
      throw error;
    }
  },
};
