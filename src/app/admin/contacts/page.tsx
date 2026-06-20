import { Mail, Inbox, Trash2, CheckCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contacts — Admin' };

// In MVP, no real contacts since DB isn't connected yet
const mockContacts = [
  { id: '1', name: 'John Doe', email: 'john@example.com', subject: 'Project Inquiry', status: 'UNREAD' as const, createdAt: '2025-01-20' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', subject: 'Collaboration Opportunity', status: 'READ' as const, createdAt: '2025-01-18' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', subject: 'Consulting Services', status: 'REPLIED' as const, createdAt: '2025-01-15' },
];

const STATUS_BADGE: Record<string, string> = {
  UNREAD: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  READ: 'bg-muted text-muted-foreground',
  REPLIED: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

export default function AdminContactsPage() {
  const unreadCount = mockContacts.filter(c => c.status === 'UNREAD').length;

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Inbox</h1>
          <p className="text-sm text-muted-foreground">
            {mockContacts.length} messages · {unreadCount} unread
          </p>
        </div>
      </div>

      {mockContacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground/60">Contact form submissions will appear here</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">From</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockContacts.map(contact => (
                <tr key={contact.id} className={`bg-card hover:bg-muted/20 transition-colors ${contact.status === 'UNREAD' ? 'font-medium' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{contact.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_BADGE[contact.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button type="button" aria-label="Mark as replied" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label={`Delete message from ${contact.name}`} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
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
    </main>
  );
}
