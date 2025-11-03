/**
 * Contact Types
 * Used for contact form and admin management
 */

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
  priority: ContactPriority;
  read: boolean;
  replied: boolean;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactStatus =
  | 'new'
  | 'in-progress'
  | 'resolved'
  | 'spam'
  | 'archived';

export type ContactPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Form types for contact submission
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
}

/**
 * Admin update types
 */
export interface ContactUpdateData {
  status?: ContactStatus;
  priority?: ContactPriority;
  read?: boolean;
  replied?: boolean;
}
