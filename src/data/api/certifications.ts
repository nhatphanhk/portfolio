import { Certification, CertificationFormData } from '@/types/Certification';

/**
 * API Service for Certification Operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const certificationApi = {
  /**
   * Fetch all certifications
   */
  async getAll(): Promise<Certification[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certifications');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching certifications:', error);
      throw error;
    }
  },

  /**
   * Fetch active certifications
   */
  async getActive(): Promise<Certification[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications/active`);

      if (!response.ok) {
        throw new Error('Failed to fetch active certifications');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching active certifications:', error);
      throw error;
    }
  },

  /**
   * Fetch featured certifications
   */
  async getFeatured(): Promise<Certification[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications/featured`);

      if (!response.ok) {
        throw new Error('Failed to fetch featured certifications');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching featured certifications:', error);
      throw error;
    }
  },

  /**
   * Create a new certification (Admin)
   */
  async create(data: CertificationFormData): Promise<Certification> {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create certification');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating certification:', error);
      throw error;
    }
  },

  /**
   * Update an existing certification (Admin)
   */
  async update(
    id: string,
    data: Partial<CertificationFormData>
  ): Promise<Certification> {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update certification');
      }

      return response.json();
    } catch (error) {
      console.error(`Error updating certification ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a certification (Admin)
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete certification');
      }
    } catch (error) {
      console.error(`Error deleting certification ${id}:`, error);
      throw error;
    }
  },
};
