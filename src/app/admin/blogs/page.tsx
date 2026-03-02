import React from 'react';
import { columns, Blog } from '@/components/admin/table/blog/column';
import { DataTable } from '@/components/admin/table/DataTable';

async function getData(): Promise<Blog[]> {
  // Fetch data from your API here.
  return [
    {
      id: '728ed52f',
      amount: 100,
      status: 'pending',
      email: 'm@example.com',
    },
    // ...
  ];
}

export default async function BlogAdminPage() {
  const data = await getData();
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
