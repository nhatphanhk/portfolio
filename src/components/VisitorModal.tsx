'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Hand } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  reason: z.string().min(5, 'Please tell me briefly why you are here'),
});

type FormData = z.infer<typeof schema>;

export function VisitorModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if we already asked the visitor in this session
    const hasVisited = sessionStorage.getItem('visitor_logged');
    if (!hasVisited) {
      // Delay showing the modal by a tiny bit to let the page render first
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const closeModal = () => {
    sessionStorage.setItem('visitor_logged', 'true');
    setOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        toast.success("Thanks for stopping by! Enjoy the portfolio.");
        closeModal();
      } else {
        toast.error("Something went wrong. You can skip for now.");
      }
    } catch (_e) {
      toast.error("Network error. You can skip for now.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Prevent closing by clicking outside if they haven't submitted or skipped
      if (!val && !sessionStorage.getItem('visitor_logged')) {
        return;
      }
      setOpen(val);
    }}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Hand className="h-5 w-5 text-primary" />
            Welcome!
          </DialogTitle>
          <DialogDescription>
            I'm excited to have you here. Could you briefly let me know who you are and why you're visiting?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name *</label>
            <input
              {...register('name')}
              placeholder="John Doe"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <input
              {...register('email')}
              type="email"
              placeholder="john@example.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason for visiting *</label>
            <textarea
              {...register('reason')}
              rows={3}
              placeholder="e.g. I'm a recruiter looking to hire, or I'm just looking for inspiration..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
            />
            {errors.reason && <p className="text-xs text-destructive mt-1">{errors.reason.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                toast("You skipped the intro. That's okay!");
                closeModal();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Continue to Portfolio'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
