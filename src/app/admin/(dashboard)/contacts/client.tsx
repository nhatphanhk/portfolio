'use client';

import { useState, useTransition, useMemo } from 'react';
import { Users, Trash2, Mail, ExternalLink, Calendar, MessageSquare, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { deleteContact, updateContactStatus } from '@/lib/actions/contact';

type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: Date;
};

const ITEMS_PER_PAGE = 10;

export function AdminContactsClient({ contacts }: { contacts: Contact[] }) {
  const [viewTarget, setViewTarget] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter and pagination state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MESSAGES' | 'VISITORS'>('MESSAGES');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const handleStatusChange = (id: string, status: 'UNREAD' | 'READ' | 'REPLIED') => {
    startTransition(() => {
      updateContactStatus(id, status);
    });
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Type filter
      const isVisitor = contact.subject === 'Visitor Log';
      if (typeFilter === 'MESSAGES' && isVisitor) return false;
      if (typeFilter === 'VISITORS' && !isVisitor) return false;

      // Status filter
      if (statusFilter !== 'ALL' && contact.status !== statusFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = contact.name.toLowerCase().includes(q);
        const matchEmail = contact.email.toLowerCase().includes(q);
        const matchSubject = (contact.subject ?? '').toLowerCase().includes(q);
        const matchMessage = contact.message.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchSubject && !matchMessage) return false;
      }

      return true;
    });
  }, [contacts, typeFilter, statusFilter, search]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE) || 1;
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredContacts, currentPage]);

  const handleTypeChange = (type: 'ALL' | 'MESSAGES' | 'VISITORS') => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const directMessagesCount = contacts.filter(c => c.subject !== 'Visitor Log').length;
  const visitorLogsCount = contacts.filter(c => c.subject === 'Visitor Log').length;
  const unreadCount = contacts.filter(c => c.status === 'UNREAD').length;

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Contact Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Manage incoming messages and visitor registrations ({contacts.length} total, {unreadCount} unread)
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('MESSAGES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'MESSAGES'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Messages ({directMessagesCount})
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('VISITORS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'VISITORS'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Visitors ({visitorLogsCount})
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'ALL'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({contacts.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, subject, or message..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-background shadow-xs text-xs text-muted-foreground transition-colors">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => handleStatusFilterChange(e.target.value)}
              className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginatedContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">No records found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter parameters'
                : 'No contacts in this section yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-border text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Sender</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Details</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginatedContacts.map(contact => (
                  <tr
                    key={contact.id}
                    onClick={() => setViewTarget(contact)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{contact.name}</p>
                          <a
                            href={`mailto:${contact.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" /> {contact.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell max-w-[240px]">
                      <p className="text-xs font-medium text-foreground truncate">{contact.subject ?? 'No subject'}</p>
                      <p className="text-xs text-muted-foreground truncate">{contact.message}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        {new Date(contact.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={contact.status}
                        onChange={e => handleStatusChange(contact.id, e.target.value as any)}
                        onClick={e => e.stopPropagation()}
                        disabled={isPending}
                        aria-label={`Change status for message from ${contact.name}`}
                        className={`px-2 py-1 text-xs rounded-lg border outline-none font-medium focus:ring-2 focus:ring-ring transition-colors cursor-pointer ${
                          contact.status === 'UNREAD'
                            ? 'bg-red-500/10 text-red-600 border-red-500/20'
                            : contact.status === 'READ'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                              : 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                        }`}
                      >
                        <option value="UNREAD">Unread</option>
                        <option value="READ">Read</option>
                        <option value="REPLIED">Replied</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          aria-label={`View message from ${contact.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewTarget(contact);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete message from ${contact.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(contact);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination in table footer */}
        {filteredContacts.length > 0 && (
          <div className="p-4 bg-card border-t border-border">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredContacts.length}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={open => !open && setViewTarget(null)}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="font-semibold text-foreground">{viewTarget.name}</p>
                  <a href={`mailto:${viewTarget.email}`} className="text-sm text-primary hover:underline">
                    {viewTarget.email}
                  </a>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{new Date(viewTarget.createdAt).toLocaleDateString()}</p>
                  <p>{new Date(viewTarget.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Subject</p>
                <p className="font-medium text-foreground">{viewTarget.subject ?? '—'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Message</p>
                <div className="bg-muted/40 p-4 rounded-xl border border-border/80 text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                  {viewTarget.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title="Delete Contact Record?"
          description="Are you sure you want to delete this message/log? This cannot be undone."
          onConfirm={() => deleteContact(deleteTarget.id)}
        />
      )}
    </main>
  );
}
