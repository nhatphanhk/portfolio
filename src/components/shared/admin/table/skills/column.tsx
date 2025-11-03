'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Skill } from '@/types/Skill';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Skill>[] = [
  {
    accessorKey: 'name',
    header: 'Skill Name',
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
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const level = row.getValue('level') as string;
      const levelColors = {
        'beginner': 'bg-gray-100 text-gray-800',
        'intermediate': 'bg-blue-100 text-blue-800',
        'advanced': 'bg-purple-100 text-purple-800',
        'expert': 'bg-green-100 text-green-800',
      };
      return (
        <Badge
          className={`capitalize ${levelColors[level as keyof typeof levelColors]}`}
          variant="secondary"
        >
          {level}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'yearsOfExperience',
    header: 'Experience',
    cell: ({ row }) => {
      const years = row.getValue('yearsOfExperience') as number | undefined;
      return <div>{years ? `${years} years` : 'N/A'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const skill = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(skill.id)}
            >
              Copy ID
            </DropdownMenuItem>
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
