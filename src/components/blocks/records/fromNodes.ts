import type { GenesisNode } from '@/lib/genesis-data';

import type { RecordRow, RecordsTableColumn } from './RecordsTable';

function toFiniteNumber(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export interface RecordsConfig {
  fields: string[];
  headers?: Record<string, string>;
  sortable?: string[];
  numericFields?: string[];
  statusField?: string;
}

export function nodesToRecords(nodes: GenesisNode[], config: RecordsConfig): RecordRow[] {
  const numeric = new Set(config.numericFields ?? []);
  return nodes.map((node) => {
    const fields = node.fieldValues;
    const row: RecordRow = { id: node.id };
    for (const field of config.fields) {
      row[field] = numeric.has(field) ? toFiniteNumber(fields[field]) : (fields[field] ?? '');
    }
    return row;
  });
}

export function recordsColumns(config: RecordsConfig): RecordsTableColumn[] {
  const numeric = new Set(config.numericFields ?? []);
  const sortable = new Set(config.sortable ?? []);
  return config.fields.map((field) => ({
    key: field,
    header: config.headers?.[field] ?? field,
    sortable: sortable.has(field),
    align: numeric.has(field) ? ('right' as const) : ('left' as const),
  }));
}

export function filterByOwner<Row extends RecordRow>(
  rows: Row[],
  ownerField: string,
  viewerId: string | null | undefined,
): Row[] {
  if (viewerId == null) {
    return rows;
  }
  return rows.filter((row) => String(row[ownerField] ?? '') === viewerId);
}

export const ACTIVITY_LOG_COLUMNS: RecordsTableColumn[] = [
  { key: 'actor', header: 'Actor', sortable: true },
  { key: 'action', header: 'Action', sortable: true },
  { key: 'target', header: 'Target', sortable: true },
  { key: 'timestamp', header: 'When', sortable: true, align: 'right' },
];

export const ACTIVITY_LOG_STATUS_FIELD = 'action' as const;

export const ACTIVITY_LOG_ROWS: RecordRow[] = [
  { id: 'log-1', actor: 'Priya Nadar', action: 'Updated', target: 'SKU-4821 stock count', timestamp: '2026-06-29 14:02' },
  { id: 'log-2', actor: 'Marcus Hale', action: 'Created', target: 'Inbound shipment #INB-309', timestamp: '2026-06-29 11:47' },
  { id: 'log-3', actor: 'Priya Nadar', action: 'Shipped', target: 'Order #ORD-1188', timestamp: '2026-06-28 16:20' },
  { id: 'log-4', actor: 'Dana Office', action: 'Deleted', target: 'Duplicate location row', timestamp: '2026-06-28 09:05' },
];
