import type { GenesisNode } from '@/lib/genesis-data';

import type { LeadField } from './LeadCaptureForm';

const TRUTHY = new Set(['true', '1', 'on', 'yes']);

export function nodeToLeadDefaults(
  node: GenesisNode,
  fields: LeadField[],
): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};
  const source = node.fieldValues ?? {};

  for (const field of fields) {
    const raw = source[field.name];
    if (field.type === 'checkbox') {
      values[field.name] = raw != null && TRUTHY.has(String(raw).toLowerCase());
    } else {
      values[field.name] = raw ?? '';
    }
  }

  return values;
}
