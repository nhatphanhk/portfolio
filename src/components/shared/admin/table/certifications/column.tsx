'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Certification } from '@/types/Certification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Certification>[] = [
  {
    accessorKey: 'name',
    header: 'Certification',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      const featured = row.original.featured;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {featured && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'issuer',
    header: 'Issuer',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusColors = {
        'active': 'bg-green-100 text-green-800',
        'expired': 'bg-red-100 text-red-800',
        'pending': 'bg-yellow-100 text-yellow-800',
      };
      return (
        <Badge
          className={`capitalize ${statusColors[status as keyof typeof statusColors]}`}
          variant="secondary"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'issuedDate',
    header: 'Issued',
    cell: ({ row }) => {
      const date = row.getValue('issuedDate') as string;
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: 'expiryDate',
    header: 'Expires',
    cell: ({ row }) => {
      const date = row.getValue('expiryDate') as string | undefined;
      return <div>{date ? new Date(date).toLocaleDateString() : 'No expiry'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const certification = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {certification.credentialUrl && (
              <DropdownMenuItem
                onClick={() => window.open(certification.credentialUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Credential
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
