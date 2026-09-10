import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-card text-foreground px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-ring/25 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-[color,box-shadow,border-color]',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
