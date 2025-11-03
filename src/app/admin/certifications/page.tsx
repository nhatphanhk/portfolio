import React from 'react';
import { columns } from '@/components/shared/admin/table/certifications/column';
import { DataTable } from '@/components/shared/admin/table/DataTable';
import { Certification } from '@/types/Certification';

async function getData(): Promise<Certification[]> {
  // TODO: Replace with actual API call
  // Example: const data = await certificationApi.getAll();

  // Temporary mock data for development
  return [
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issuedDate: '2023-06-15',
      expiryDate: '2026-06-15',
      credentialId: 'AWS-CSA-123456',
      status: 'active',
      featured: true,
      createdAt: '2023-06-15',
      updatedAt: '2023-06-15',
    },
  ];
}

export default async function CertificationsAdminPage() {
  const data = await getData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Certifications</h1>
        <p className="text-muted-foreground mt-2">
          Create, edit, and manage your professional certifications
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
