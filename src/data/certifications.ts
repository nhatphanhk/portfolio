// src/data/certifications.ts
// Static certifications data — replace with DB data in production

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string; // ISO date string
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: '1',
    name: 'AWS Certified Developer – Associate',
    issuer: 'Amazon Web Services',
    issueDate: '2023-06-15',
    expiryDate: '2026-06-15',
    credentialId: 'AWS-DEV-12345',
    credentialUrl: 'https://aws.amazon.com/verification',
    description: 'Validates expertise in developing and deploying applications on AWS.',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Google Professional Cloud Developer',
    issuer: 'Google Cloud',
    issueDate: '2022-11-20',
    expiryDate: '2024-11-20',
    credentialId: 'GCP-DEV-67890',
    credentialUrl: 'https://cloud.google.com/certification',
    description: 'Demonstrates proficiency in building scalable and highly available applications on Google Cloud.',
    status: 'EXPIRED',
  },
  {
    id: '3',
    name: 'Meta Front-End Developer Certificate',
    issuer: 'Meta (Coursera)',
    issueDate: '2022-03-10',
    credentialId: 'META-FE-11111',
    credentialUrl: 'https://coursera.org/verify/professional-cert',
    description: 'Professional certification covering React, JavaScript, UX design, and responsive development.',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'MongoDB Associate Developer',
    issuer: 'MongoDB University',
    issueDate: '2023-09-05',
    expiryDate: '2026-09-05',
    credentialId: 'MDB-DEV-22222',
    credentialUrl: 'https://learn.mongodb.com/c/verify',
    description: 'Validates skills in building, deploying, and managing MongoDB databases.',
    status: 'ACTIVE',
  },
  {
    id: '5',
    name: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    issueDate: '2020-08-01',
    credentialUrl: 'https://freecodecamp.org/certification',
    description: 'Covers HTML5, CSS3, Flexbox, Grid, and accessibility principles.',
    status: 'ACTIVE',
  },
];

/**
 * Returns certifications sorted by issue date (most recent first).
 */
export function getAllCertifications(): Certification[] {
  return [...CERTIFICATIONS].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );
}

export function getActiveCertifications(): Certification[] {
  return getAllCertifications().filter(c => c.status === 'ACTIVE');
}
