import React from 'react';
import { columns } from '@/components/shared/admin/table/skills/column';
import { DataTable } from '@/components/shared/admin/table/DataTable';
import { Skill } from '@/types/Skill';

async function getData(): Promise<Skill[]> {
  // TODO: Replace with actual API call
  // Example: const data = await skillApi.getAll();

  // Temporary mock data for development
  return [
    {
      id: '1',
      name: 'TypeScript',
      category: 'frontend',
      level: 'advanced',
      yearsOfExperience: 3,
      featured: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'React',
      category: 'frontend',
      level: 'expert',
      yearsOfExperience: 4,
      featured: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
  ];
}

export default async function SkillsAdminPage() {
  const data = await getData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Skills</h1>
        <p className="text-muted-foreground mt-2">
          Create, edit, and manage your technical skills
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
