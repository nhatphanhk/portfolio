'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: number | string;
  items?: NavSubItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  const isSubItemActive = (url: string) => {
    if (url === '/admin') return pathname === '/admin';
    return pathname === url || pathname.startsWith(url + '/');
  };

  const isItemActive = (item: NavItem) => {
    if (item.items && item.items.length > 0) {
      return item.items.some(sub => isSubItemActive(sub.url));
    }
    if (item.url === '/admin') return pathname === '/admin';
    return pathname === item.url || pathname.startsWith(item.url + '/');
  };

  return (
    <div className="space-y-4 py-2">
      {groups.map((group, groupIdx) => (
        <SidebarGroup key={group.label || groupIdx} className="py-1">
          {group.label && (
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-1">
              {group.label}
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="space-y-1">
            {group.items.map(item => {
              const active = isItemActive(item);
              const hasSubItems = Boolean(item.items && item.items.length > 0);

              return hasSubItems ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={active}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={`transition-all duration-150 rounded-xl px-3 py-2 text-sm font-medium ${
                          active
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs shadow-sidebar-primary/25 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        {item.icon && (
                          <item.icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/60'
                            }`}
                          />
                        )}
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge != null && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sidebar-primary/20 text-sidebar-primary">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="ml-auto w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-70" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="my-1 ml-4 pl-3 border-l-2 border-sidebar-border space-y-0.5">
                        {item.items!.map(subItem => {
                          const subActive = isSubItemActive(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  href={subItem.url}
                                  className={`block rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                    subActive
                                      ? 'bg-sidebar-primary/20 text-sidebar-primary font-bold shadow-xs'
                                      : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                                  }`}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-150 ${
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs shadow-sidebar-primary/25 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      {item.icon && (
                        <item.icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/60'
                          }`}
                        />
                      )}
                      <span className="flex-1">{item.title}</span>
                      {item.badge != null && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            active
                              ? 'bg-sidebar-primary-foreground text-sidebar-primary'
                              : 'bg-sidebar-primary/20 text-sidebar-primary'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  );
}
