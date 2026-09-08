'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
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
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isSubItemActive = (url: string) => {
    return pathname === url;
  };

  const isItemActive = (item: NavItem) => {
    if (item.items && item.items.length > 0) {
      return item.items.some(sub => pathname === sub.url);
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

              if (hasSubItems) {
                // When sidebar is collapsed to icon mode, show a flyout DropdownMenu
                if (isCollapsed) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="right"
                          align="start"
                          sideOffset={8}
                          className="min-w-48 rounded-xl p-1.5 shadow-xl border border-sidebar-border bg-sidebar text-sidebar-foreground"
                        >
                          <DropdownMenuLabel className="text-xs font-bold text-sidebar-foreground/70 px-2.5 py-1">
                            {item.title}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-sidebar-border" />
                          {item.items!.map(subItem => {
                            const subActive = isSubItemActive(subItem.url);
                            return (
                              <DropdownMenuItem key={subItem.title} asChild>
                                <Link
                                  href={subItem.url}
                                  className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                                    subActive
                                      ? 'bg-sidebar-primary/20 text-sidebar-primary font-bold shadow-xs'
                                      : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                                  }`}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                }

                // Normal expanded view: Collapsible accordion
                return (
                  <NavCollapsibleItem
                    key={item.title}
                    item={item}
                    active={active}
                    isSubItemActive={isSubItemActive}
                  />
                );
              }

              // Single item without sub-items
              return (
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

function NavCollapsibleItem({
  item,
  active,
  isSubItemActive,
}: {
  item: NavItem;
  active: boolean;
  isSubItemActive: (url: string) => boolean;
}) {
  const [isOpen, setIsOpen] = useState(active);

  // Auto-expand when active route is inside this group
  useEffect(() => {
    if (active) {
      setIsOpen(true);
    }
  }, [active]);

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={setIsOpen}
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
            <ChevronRight
              className={`ml-auto w-3.5 h-3.5 transition-transform duration-200 opacity-70 ${
                isOpen ? 'rotate-90' : ''
              }`}
            />
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
  );
}
