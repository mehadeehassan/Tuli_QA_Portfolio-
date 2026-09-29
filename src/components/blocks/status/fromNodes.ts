import type { GenesisNode } from '@/lib/genesis-data';

import type { ChecklistItem } from './StatusTracker';

export interface ChecklistConfig {
  labelField: string;
  statusField: string;
  groupField?: string;
  ownerField?: string;
  doneStatuses?: string[];
}

export function nodesToChecklist(nodes: GenesisNode[], config: ChecklistConfig): ChecklistItem[] {
  const done = config.doneStatuses?.map((status) => status.trim().toLowerCase());
  return nodes.map((node) => {
    const fields = node.fieldValues;
    const status = fields[config.statusField] ?? '';
    const item: ChecklistItem = {
      id: node.id,
      label: fields[config.labelField] ?? '',
      status,
    };
    if (done) {
      item.done = done.includes(status.trim().toLowerCase());
    }
    if (config.groupField) {
      item.group = fields[config.groupField] ?? '';
    }
    if (config.ownerField) {
      item.owner = fields[config.ownerField] ?? '';
    }
    return item;
  });
}

export const RECEIVING_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'recv-1', label: 'Verify packing slip vs PO', status: 'Done', done: true, group: 'Inbound #INB-309', owner: 'Marcus Hale', dueDate: '2026-06-29' },
  { id: 'recv-2', label: 'Inspect for damage', status: 'In Progress', done: false, group: 'Inbound #INB-309', owner: 'Marcus Hale', dueDate: '2026-06-29' },
  { id: 'recv-3', label: 'Scan SKUs into inventory', status: 'Blocked', done: false, group: 'Inbound #INB-309', owner: 'Priya Nadar', dueDate: '2026-06-29', meta: [{ label: 'Reason', value: 'Scanner offline' }] },
  { id: 'recv-4', label: 'Sign off + file BOL', status: 'Open', done: false, group: 'Inbound #INB-309', owner: 'Dana Office', dueDate: '2026-06-30' },
];

export const ONBOARDING_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'onb-1', label: 'Sign engagement agreement', status: 'Completed', done: true, group: 'Northwind Co', owner: 'Paul K.', dueDate: '2026-06-24' },
  { id: 'onb-2', label: 'Upload ID/docs', status: 'In Progress', done: false, group: 'Northwind Co', owner: 'Client', dueDate: '2026-06-30' },
  { id: 'onb-3', label: 'Schedule kickoff call', status: 'Pending', done: false, group: 'Northwind Co', owner: 'Paul K.', dueDate: '2026-07-01' },
  { id: 'onb-4', label: 'Grant portal access', status: 'Open', done: false, group: 'Northwind Co', owner: 'Paul K.', dueDate: '2026-07-02' },
];
