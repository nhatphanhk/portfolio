'use client';

import { useState, useTransition } from 'react';
import { Users, Trash2, Mail, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
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

export function AdminContactsClient({ contacts }: { contacts: Contact[] }) {
  const [viewTarget, setViewTarget] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: 'UNREAD' | 'READ' | 'REPLIED') => {
    startTransition(() => {
      updateContactStatus(id, status);
    });
  };

  const visitors = contacts.filter(c => c.subject === 'Visitor Log');
  const messages = contacts.filter(c => c.subject !== 'Visitor Log');

  const renderTable = (data: Contact[]) => (
    <div className="rounded-xl border border-border overflow-hidden">
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
          <p>No records found</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sender</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Details</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map(contact => (
              <tr key={contact.id} className="bg-card hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{contact.name}</p>
                      <a href={`mailto:${contact.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {contact.email}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell max-w-[200px]">
                  <p className="text-xs font-medium text-foreground truncate">{contact.subject ?? 'No subject'}</p>
                  <p className="text-xs text-muted-foreground truncate">{contact.message}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={contact.status}
                    onChange={(e) => handleStatusChange(contact.id, e.target.value as any)}
                    disabled={isPending}
                    className={`px-2 py-1 text-xs rounded border outline-none focus:ring-2 focus:ring-ring ${
                      contact.status === 'UNREAD' ? 'bg-red-500/10 text-red-600 border-red-500/20'
                      : contact.status === 'READ' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                      : 'bg-green-500/10 text-green-600 border-green-500/20'
                    }`}
                  >
                    <option value="UNREAD">Unread</option>
                    <option value="READ">Read</option>
                    <option value="REPLIED">Replied</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button type="button" aria-label={`View message from ${contact.name}`} onClick={() => setViewTarget(contact)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label={`Delete message from ${contact.name}`} onClick={() => setDeleteTarget(contact)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Contacts & Visitors</h1>
        <p className="text-sm text-muted-foreground">Manage messages and portfolio visitor logs</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Direct Messages ({messages.length})
          </h2>
          {renderTable(messages)}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Visitor Logs ({visitors.length})
          </h2>
          {renderTable(visitors)}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={open => !open && setViewTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="font-semibold text-foreground">{viewTarget.name}</p>
                  <a href={`mailto:${viewTarget.email}`} className="text-sm text-primary hover:underline">{viewTarget.email}</a>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{new Date(viewTarget.createdAt).toLocaleDateString()}</p>
                  <p>{new Date(viewTarget.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{viewTarget.subject ?? '—'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Message</p>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {viewTarget.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
