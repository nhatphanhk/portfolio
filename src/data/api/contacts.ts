import { Contact, ContactFormData, ContactUpdateData } from '@/types/Contact';

/**
 * API Service for Contact Operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const contactApi = {
  /**
   * Fetch all contacts (Admin)
   */
  async getAll(): Promise<Contact[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  /**
   * Fetch unread contacts (Admin)
   */
  async getUnread(): Promise<Contact[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/unread`);

      if (!response.ok) {
        throw new Error('Failed to fetch unread contacts');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching unread contacts:', error);
      throw error;
    }
  },

  /**
   * Submit a contact form (Public)
   */
  async submit(data: ContactFormData): Promise<Contact> {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }

      return response.json();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  },

  /**
   * Update contact status (Admin)
   */
  async update(id: string, data: ContactUpdateData): Promise<Contact> {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      return response.json();
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark contact as read (Admin)
   */
  async markAsRead(id: string): Promise<Contact> {
    return this.update(id, { read: true });
  },

  /**
   * Delete a contact (Admin)
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  },
};
