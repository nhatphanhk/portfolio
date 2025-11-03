'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Project } from '@/types/Project';
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

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const title = row.getValue('title') as string;
      const featured = row.original.featured;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
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
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      return (
        <Badge variant="outline" className="capitalize">
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusColors = {
        'in-progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'archived': 'bg-gray-100 text-gray-800',
        'planning': 'bg-yellow-100 text-yellow-800',
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
    accessorKey: 'technologies',
    header: 'Technologies',
    cell: ({ row }) => {
      const technologies = row.getValue('technologies') as string[];
      return (
        <div className="flex gap-1">
          {technologies.slice(0, 2).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {technologies.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{technologies.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => {
      const date = row.getValue('startDate') as string;
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original;

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
            {project.liveUrl && (
              <DropdownMenuItem
                onClick={() => window.open(project.liveUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Live
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
