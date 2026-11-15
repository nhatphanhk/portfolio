'use client';

import { useEffect, useState, useTransition, useMemo } from 'react';
import { Trash2, Mail, ExternalLink, Calendar, MessageSquare, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { deleteContact, updateContactStatus } from '@/lib/actions/contact';
import { formatDate } from '@/lib/utils';

type ContactStatus = 'UNREAD' | 'READ' | 'REPLIED';

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

const STATUS_LABELS: Record<ContactStatus, string> = {
  UNREAD: 'Chưa đọc',
  READ: 'Đã đọc',
  REPLIED: 'Đã trả lời',
};

export function AdminContactsClient({ contacts }: { contacts: Contact[] }) {
  // Local copy so status changes show immediately; re-synced when the server data refreshes
  const [rows, setRows] = useState<Contact[]>(contacts);
  useEffect(() => setRows(contacts), [contacts]);

  const [viewTarget, setViewTarget] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const handleStatusChange = (id: string, status: ContactStatus) => {
    const previous = rows.find(c => c.id === id)?.status;
    setRows(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
    startTransition(async () => {
      const res = await updateContactStatus(id, status);
      if (!res.ok) {
        setRows(prev => prev.map(c => (c.id === id ? { ...c, status: previous ?? c.status } : c)));
        toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    });
  };

  // Opening a message marks it as read
  const openMessage = (contact: Contact) => {
    setViewTarget(contact);
    if (contact.status === 'UNREAD') handleStatusChange(contact.id, 'READ');
  };

  const filteredContacts = useMemo(() => {
    return rows.filter(contact => {
      if (statusFilter !== 'ALL' && contact.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const haystack = [contact.name, contact.email, contact.subject ?? '', contact.message].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, search]);

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE) || 1;
  // Keep the page in range when rows are deleted or filters shrink the list
  useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages));
  }, [totalPages]);
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredContacts, currentPage]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const unreadCount = rows.filter(c => c.status === 'UNREAD').length;

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <AdminPageHeader
        title="Hộp thư liên hệ"
        description={`${rows.length} tin nhắn từ form liên hệ, ${unreadCount} chưa đọc. Khách qua cổng chào nằm ở mục Khách truy cập.`}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, tiêu đề hoặc nội dung..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            aria-label="Tìm kiếm tin nhắn"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-card shadow-xs text-xs transition-colors ${
              statusFilter !== 'ALL' ? 'border-primary/40 text-foreground' : 'border-border text-muted-foreground'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => handleStatusFilterChange(e.target.value)}
              aria-label="Lọc theo trạng thái"
              className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="UNREAD">Chưa đọc</option>
              <option value="READ">Đã đọc</option>
              <option value="REPLIED">Đã trả lời</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginatedContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">Không có tin nhắn nào</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Thử thay đổi từ khóa hoặc bộ lọc'
                : 'Chưa có ai gửi tin nhắn qua form liên hệ'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold">Người gửi</th>
                  <th className="text-left px-4 py-3.5 font-semibold hidden md:table-cell">Nội dung</th>
                  <th className="text-left px-4 py-3.5 font-semibold hidden sm:table-cell">Ngày gửi</th>
                  <th className="text-left px-4 py-3.5 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginatedContacts.map(contact => (
                  <tr
                    key={contact.id}
                    onClick={() => openMessage(contact)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {contact.name}
                          </p>
                          <a
                            href={`mailto:${contact.email}`}
                            onClick={e => e.stopPropagation()}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" aria-hidden="true" /> {contact.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell max-w-[240px]">
                      <p className="text-xs font-medium text-foreground truncate">{contact.subject ?? 'Không có tiêu đề'}</p>
                      <p className="text-xs text-muted-foreground truncate">{contact.message}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        {formatDate(contact.createdAt, 'vi')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={contact.status}
                        onChange={e => handleStatusChange(contact.id, e.target.value as ContactStatus)}
                        onClick={e => e.stopPropagation()}
                        disabled={isPending}
                        aria-label={`Đổi trạng thái tin nhắn của ${contact.name}`}
                        className={`px-2 py-1 text-xs rounded-lg border outline-none font-medium focus:ring-2 focus:ring-ring transition-colors cursor-pointer ${
                          contact.status === 'UNREAD'
                            ? 'bg-red-500/10 text-red-600 border-red-500/20'
                            : contact.status === 'READ'
                              ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                              : 'bg-green-500/10 text-green-700 border-green-500/20'
                        }`}
                      >
                        {(Object.keys(STATUS_LABELS) as ContactStatus[]).map(s => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          aria-label={`Xem tin nhắn của ${contact.name}`}
                          onClick={e => {
                            e.stopPropagation();
                            openMessage(contact);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa tin nhắn của ${contact.name}`}
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteTarget(contact);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredContacts.length > 0 && (
          <div className="p-4 bg-card border-t border-border">
            <PaginationControl
              locale="vi"
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
        <DialogContent className="max-w-lg bg-card max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tin nhắn</DialogTitle>
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
                  <p>{formatDate(viewTarget.createdAt, 'vi', 'numeric')}</p>
                  <p>{new Date(viewTarget.createdAt).toLocaleTimeString('vi-VN', { timeZone: 'UTC' })} (UTC)</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tiêu đề</p>
                <p className="font-medium text-foreground">{viewTarget.subject ?? '—'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nội dung</p>
                <div className="bg-muted/40 p-4 rounded-xl border border-border/80 text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                  {viewTarget.message}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
                <a
                  href={`mailto:${viewTarget.email}?subject=${encodeURIComponent(`Re: ${viewTarget.subject ?? 'Liên hệ'}`)}`}
                  onClick={() => handleStatusChange(viewTarget.id, 'REPLIED')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Trả lời qua email
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(viewTarget);
                    setViewTarget(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Xóa
                </button>
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
          title="Xóa tin nhắn này?"
          description="Tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục."
          successMessage="Đã xóa tin nhắn."
          onConfirm={() => deleteContact(deleteTarget.id)}
        />
      )}
    </main>
  );
}
