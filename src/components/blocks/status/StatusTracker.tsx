'use client';

import { CheckCircle2, Circle, CircleDot, CircleSlash } from 'lucide-react';
import * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  id: string;
  label: string;
  status: string;
  done?: boolean;
  group?: string;
  owner?: string;
  dueDate?: string;
  meta?: { label: string; value: string }[];
}

export interface StatusTrackerProps {
  items: ChecklistItem[];
  title?: string;
  groupBy?: keyof ChecklistItem & string;
  showProgress?: boolean;
  statusColors?: Record<string, StatusBucket>;
  onToggle?: (item: ChecklistItem, done: boolean) => void;
  emptyText?: string;
  className?: string;
}

const STATUS_BADGE = {
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-primary text-primary-foreground',
  warning: 'bg-secondary text-secondary-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  __default: 'bg-muted text-muted-foreground',
} as const;

export type StatusBucket = keyof typeof STATUS_BADGE;

const STATUS_KEYWORDS: Record<string, StatusBucket> = {
  open: 'neutral',
  'not started': 'neutral',
  todo: 'neutral',
  'to do': 'neutral',
  pending: 'warning',
  waiting: 'warning',
  'in progress': 'accent',
  started: 'accent',
  'in review': 'accent',
  blocked: 'danger',
  'on hold': 'warning',
  overdue: 'danger',
  failed: 'danger',
  done: 'success',
  complete: 'success',
  completed: 'success',
  approved: 'success',
  signed: 'success',
};

function bucketFor(value: string, overrides?: Record<string, StatusBucket>): StatusBucket {
  if (overrides && overrides[value]) {
    return overrides[value];
  }
  const key = value.trim().toLowerCase();
  return STATUS_KEYWORDS[key] ?? '__default';
}

function iconFor(bucket: StatusBucket, done: boolean) {
  if (done || bucket === 'success' || bucket === 'primary') {
    return CheckCircle2;
  }
  if (bucket === 'accent') {
    return CircleDot;
  }
  if (bucket === 'danger' || bucket === 'warning') {
    return CircleSlash;
  }
  return Circle;
}

function fieldText(item: ChecklistItem, field: keyof ChecklistItem & string): string {
  const raw = item[field];
  if (raw == null) {
    return '';
  }
  if (typeof raw === 'boolean') {
    return raw ? 'true' : 'false';
  }
  if (Array.isArray(raw)) {
    return '';
  }
  return String(raw);
}

function groupItems(
  items: ChecklistItem[],
  field: keyof ChecklistItem & string,
): { key: string; items: ChecklistItem[] }[] {
  const order: string[] = [];
  const groups: Record<string, ChecklistItem[]> = {};
  for (const item of items) {
    const key = fieldText(item, field) || 'Ungrouped';
    if (!(key in groups)) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(item);
  }
  return order.map((key) => ({ key, items: groups[key] }));
}

export function StatusTracker({
  items,
  title,
  groupBy,
  showProgress = true,
  statusColors,
  onToggle,
  emptyText = 'Nothing to track',
  className,
}: StatusTrackerProps) {
  const [doneById, setDoneById] = React.useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {};
    for (const item of items) {
      next[item.id] = Boolean(item.done);
    }
    return next;
  });

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of items) {
      next[item.id] = Boolean(item.done);
    }
    setDoneById(next);
  }, [items]);

  const isDone = React.useCallback(
    (item: ChecklistItem) => doneById[item.id] ?? Boolean(item.done),
    [doneById],
  );

  const total = items.length;
  const completed = React.useMemo(
    () => items.reduce((acc, item) => acc + (isDone(item) ? 1 : 0), 0),
    [items, isDone],
  );
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggle = React.useCallback(
    (item: ChecklistItem, next: boolean) => {
      setDoneById((prev) => ({ ...prev, [item.id]: next }));
      onToggle?.(item, next);
    },
    [onToggle],
  );

  const groups = React.useMemo(
    () => (groupBy ? groupItems(items, groupBy) : null),
    [items, groupBy],
  );

  function renderRow(item: ChecklistItem) {
    const done = isDone(item);
    const bucket = bucketFor(item.status, statusColors);
    const Icon = iconFor(bucket, done);
    return (
      <div key={item.id} className="flex items-start gap-3 py-2">
        <Checkbox
          checked={done}
          onCheckedChange={(value) => handleToggle(item, value === true)}
          aria-label={`Mark ${item.label} ${done ? 'not done' : 'done'}`}
          className="mt-0.5"
        />
        <Icon
          className={cn(
            'mt-0.5 size-4 shrink-0',
            done ? 'text-muted-foreground' : 'text-foreground',
          )}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-foreground text-sm font-medium',
                done && 'text-muted-foreground line-through',
              )}
            >
              {item.label}
            </span>
            <Badge className={STATUS_BADGE[bucket]}>{item.status}</Badge>
          </div>
          {item.owner || item.dueDate ? (
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
              {item.owner ? <span>{item.owner}</span> : null}
              {item.dueDate ? <span className="tabular-nums">Due {item.dueDate}</span> : null}
            </div>
          ) : null}
          {item.meta && item.meta.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {item.meta.map((field) => (
                <div
                  key={field.label}
                  className="flex items-baseline justify-between gap-2 text-xs"
                >
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="text-foreground tabular-nums">{field.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const summary =
    total === 0 ? null : (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            {completed} of {total} done
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">{percent}%</span>
        </div>
        <Progress value={percent} aria-label={`${completed} of ${total} done`} />
      </div>
    );

  return (
    <Card
      data-genesis-block="status-tracker"
      className={cn('bg-card text-card-foreground', className)}
    >
      {title || (showProgress && summary) ? (
        <CardHeader className="gap-3">
          {title ? <CardTitle className="text-base font-semibold">{title}</CardTitle> : null}
          {showProgress ? summary : null}
        </CardHeader>
      ) : null}

      <CardContent>
        {total === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <CircleSlash aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{emptyText}</EmptyTitle>
            <EmptyDescription>Items you add will show up here.</EmptyDescription>
          </Empty>
        ) : groups ? (
          <Accordion
            type="multiple"
            defaultValue={groups.map((group) => group.key)}
            className="w-full"
          >
            {groups.map((group) => {
              const groupDone = group.items.reduce((acc, item) => acc + (isDone(item) ? 1 : 0), 0);
              return (
                <AccordionItem key={group.key} value={group.key}>
                  <AccordionTrigger>
                    <span className="flex flex-1 items-center justify-between gap-2 pr-2">
                      <span className="text-foreground">{group.key}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {groupDone}/{group.items.length}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col">
                      {group.items.map((item) => renderRow(item))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="flex flex-col">
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 ? <Separator /> : null}
                {renderRow(item)}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
