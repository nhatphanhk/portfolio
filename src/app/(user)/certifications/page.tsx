'use client';

import { MainLayout } from '@/components/shared';
import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  Building2,
  ExternalLink,
  Download,
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  category: string;
  status: 'active' | 'expired' | 'pending';
  credentialId: string;
  skills: string[];
  description: string;
  certificateUrl?: string;
  verifyUrl?: string;
  logo?: string;
}

const certifications: Certification[] = [
  {
    id: '1',
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    date: '2024-01-15',
    expiryDate: '2027-01-15',
    category: 'Cloud Computing',
    status: 'active',
    credentialId: 'AWS-SAA-2024-001',
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'Lambda'],
    description:
      'Validates expertise in designing and deploying scalable, highly available systems on AWS.',
    certificateUrl: '#',
    verifyUrl: '#',
  },
  {
    id: '2',
    name: 'Certified Kubernetes Administrator',
    issuer: 'Cloud Native Computing Foundation',
    date: '2023-11-20',
    expiryDate: '2026-11-20',
    category: 'Container Orchestration',
    status: 'active',
    credentialId: 'CKA-2023-789',
    skills: ['Kubernetes', 'Docker', 'Container Orchestration', 'DevOps'],
    description:
      'Demonstrates the ability to perform the responsibilities of Kubernetes administrators.',
    certificateUrl: '#',
    verifyUrl: '#',
  },
  {
    id: '3',
    name: 'Google Cloud Professional Data Engineer',
    issuer: 'Google Cloud',
    date: '2023-09-10',
    expiryDate: '2025-09-10',
    category: 'Data Engineering',
    status: 'active',
    credentialId: 'GCP-PDE-2023-456',
    skills: [
      'BigQuery',
      'Dataflow',
      'Pub/Sub',
      'Machine Learning',
      'Data Pipeline',
    ],
    description:
      'Validates skills in designing and building data processing systems on Google Cloud Platform.',
    certificateUrl: '#',
    verifyUrl: '#',
  },
  {
    id: '4',
    name: 'Microsoft Azure Developer Associate',
    issuer: 'Microsoft',
    date: '2023-07-05',
    expiryDate: '2025-07-05',
    category: 'Cloud Development',
    status: 'active',
    credentialId: 'AZ-204-2023-123',
    skills: ['Azure', 'C#', '.NET', 'REST APIs', 'Azure Functions'],
    description:
      'Demonstrates proficiency in developing cloud solutions on Microsoft Azure platform.',
    certificateUrl: '#',
    verifyUrl: '#',
  },
  {
    id: '5',
    name: 'Certified ScrumMaster',
    issuer: 'Scrum Alliance',
    date: '2022-03-12',
    expiryDate: '2024-03-12',
    category: 'Project Management',
    status: 'expired',
    credentialId: 'CSM-2022-987',
    skills: ['Scrum', 'Agile', 'Team Leadership', 'Sprint Planning'],
    description:
      'Validates understanding of Scrum framework and ability to lead Scrum teams effectively.',
    certificateUrl: '#',
    verifyUrl: '#',
  },
  {
    id: '6',
    name: 'Certified Information Security Manager',
    issuer: 'ISACA',
    date: '2024-02-28',
    category: 'Security',
    status: 'pending',
    credentialId: 'CISM-2024-555',
    skills: [
      'Information Security',
      'Risk Management',
      'Governance',
      'Incident Response',
    ],
    description:
      'Validates expertise in information security management and governance.',
    certificateUrl: '#',
    verifyUrl: '#',
  },
];

export default function CertificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCertifications = useMemo(() => {
    return certifications.filter(cert => {
      const matchesSearch =
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.skills.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'All' || cert.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <MainLayout>
      <div className="lg:col-span-12 py-4">
        {/* Hero Section */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-3xl shadow-xl">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
                Professional Certifications
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Showcasing expertise through industry-recognized certifications
                and continuous learning achievements
              </p>
            </div>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="space-y-8 grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {filteredCertifications.map(cert => (
            <div
              key={cert.id}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group flex flex-col h-full min-w-0"
            >
              {/* Card Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-2 leading-tight truncate text-white">
                        {cert.name}
                      </h3>
                      <div className="flex items-center text-white/90 text-sm">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span className="font-medium truncate">
                          {cert.issuer}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-white/85 text-sm leading-relaxed">
                    {cert.description}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 bg-white dark:bg-slate-800">
                {/* Skills */}
                <div className="mb-6">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mr-2"></div>
                    Skills & Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-lg border border-blue-100 dark:border-blue-800 hover:border-blue-300 transition-all duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-sm text-slate-700 dark:text-slate-200 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <div>
                      <div className="font-bold text-xs text-slate-500 dark:text-slate-300">
                        Issued
                      </div>
                      <div className="text-slate-900 dark:text-slate-100 font-semibold">
                        {new Date(cert.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {cert.expiryDate && (
                    <div className="flex items-center text-sm text-slate-700 dark:text-slate-200 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      <div>
                        <div className="font-bold text-xs text-slate-500 dark:text-slate-300">
                          Expires
                        </div>
                        <div className="text-slate-900 dark:text-slate-100 font-semibold">
                          {new Date(cert.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-700 dark:text-slate-200 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <Award className="w-4 h-4 mr-2 text-blue-600" />
                    <div>
                      <div className="font-bold text-xs text-slate-500 dark:text-slate-300">
                        Credential ID
                      </div>
                      <div className="font-mono text-slate-900 dark:text-slate-100 font-semibold text-xs">
                        {cert.credentialId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                  {cert.certificateUrl && (
                    <a
                      href={cert.certificateUrl}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Certificate
                    </a>
                  )}
                  {cert.verifyUrl && (
                    <a
                      href={cert.verifyUrl}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 border border-slate-300 dark:border-slate-600 shadow-sm hover:shadow-md"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Verify
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results State */}
        {filteredCertifications.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-lg max-w-md mx-auto border border-slate-200 dark:border-slate-700">
              <div className="bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 p-4 rounded-full w-fit mx-auto mb-6">
                <Award className="w-16 h-16 text-slate-400 dark:text-slate-200" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                No certifications found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
