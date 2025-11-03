import React from 'react';
import { columns } from '@/components/shared/admin/table/contact/column';
import { DataTable } from '@/components/shared/admin/table/DataTable';
import { Contact } from '@/types/Contact';

async function getData(): Promise<Contact[]> {
  // TODO: Replace with actual API call
  // Example: const data = await contactApi.getAll();

  // Temporary mock data for development
  return [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      subject: 'Project Inquiry',
      message: 'I would like to discuss a potential project collaboration.',
      status: 'new',
      priority: 'medium',
      read: false,
      replied: false,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
  ];
}

export default async function ContactAdminPage() {
  const data = await getData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Contacts</h1>
        <p className="text-muted-foreground mt-2">
          View and respond to contact form submissions
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
