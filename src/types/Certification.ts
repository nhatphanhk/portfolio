/**
 * Certification Types
 * Used for certifications display and admin management
 */

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  icon?: string;
  image?: string;
  skills?: string[];
  status: CertificationStatus;
  featured: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export type CertificationStatus = 'active' | 'expired' | 'pending';

/**
 * Form types for creating/editing certifications
 */
export interface CertificationFormData {
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skills?: string[];
  featured: boolean;
}
