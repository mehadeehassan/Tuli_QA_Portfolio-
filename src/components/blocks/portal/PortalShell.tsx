'use client';

import { LogOut, type LucideIcon } from 'lucide-react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface PortalSection {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface PortalShellProps {
  brand: { name: string; logo?: React.ReactNode };
  viewer?: { name: string; email?: string; avatarUrl?: string };
  sections: PortalSection[];
  activeSection?: string;
  onSectionChange?: (id: string) => void;
  onSignOut?: () => void;
  showOwnerNote?: boolean;
  children: React.ReactNode;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PortalShell({
  brand,
  viewer,
  sections,
  activeSection,
  onSectionChange,
  onSignOut,
  showOwnerNote = true,
  children,
  className,
}: PortalShellProps) {
  const active = activeSection ?? sections[0]?.id;

  return (
    <div
      data-genesis-block="portal-shell"
      className={cn('bg-background text-foreground min-h-full', className)}
    >
      <header className="bg-card text-card-foreground border-b">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {brand.logo ? (
              <div className="flex size-9 shrink-0 items-center justify-center">{brand.logo}</div>
            ) : null}
            <span className="text-foreground text-base font-semibold tracking-tight">
              {brand.name}
            </span>
          </div>

          {viewer ? (
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end leading-tight sm:flex">
                <span className="text-foreground text-sm font-medium">{viewer.name}</span>
                {viewer.email ? (
                  <span className="text-muted-foreground text-xs">{viewer.email}</span>
                ) : null}
              </div>
              <Avatar>
                {viewer.avatarUrl ? <AvatarImage src={viewer.avatarUrl} alt={viewer.name} /> : null}
                <AvatarFallback className="text-xs font-medium">
                  {initials(viewer.name)}
                </AvatarFallback>
              </Avatar>
              {onSignOut ? (
                <Button variant="ghost" size="icon-sm" onClick={onSignOut} aria-label="Sign out">
                  <LogOut className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {sections.length > 0 ? (
          <div className="px-4 pb-3 sm:px-6">
            <Tabs value={active} onValueChange={onSectionChange}>
              <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
                {sections.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <TabsTrigger key={section.id} value={section.id}>
                      {SectionIcon ? <SectionIcon className="size-4" aria-hidden /> : null}
                      {section.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        ) : null}
      </header>

      <main className="px-4 py-6 sm:px-6">
        {viewer ? (
          <div className="mb-4 flex items-center gap-2">
            <h1 className="text-foreground text-xl font-semibold tracking-tight">
              Welcome back, {viewer.name.split(/\s+/)[0]}
            </h1>
            <Badge variant="secondary" className="font-normal">
              Member portal
            </Badge>
          </div>
        ) : null}

        {showOwnerNote ? (
          <Card className="bg-card text-card-foreground mb-4">
            <CardContent className="py-3">
              <p className="text-muted-foreground text-xs">
                Showing your records.{' '}
                <span className="opacity-80">
                  Display-only convenience - not a security boundary. Per-user privacy requires
                  gateway row scoping enabled by the Taskade team.
                </span>
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Separator className="mb-6" />

        <div className="bg-accent/30 rounded-xl">{children}</div>
      </main>
    </div>
  );
}

export const CLIENT_PORTAL_SECTIONS: PortalSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'jobs', label: 'My Jobs' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'messages', label: 'Messages' },
];
