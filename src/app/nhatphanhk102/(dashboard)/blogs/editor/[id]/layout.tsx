/**
 * Editor layout: overrides the dashboard's overflow-y-auto container
 * so the full-page editor can control its own scrolling.
 */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {children}
    </div>
  );
}
