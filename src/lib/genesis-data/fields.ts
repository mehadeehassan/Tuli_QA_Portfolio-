import type { GenesisNode } from './client';

export function getFieldValue(node: GenesisNode, ...fieldKeys: string[]): string | null {
  for (const fieldKey of fieldKeys) {
    const value: unknown = node.fieldValues[fieldKey];
    if (value != null) {
      return typeof value === 'string' ? value : String(value);
    }
  }
  return null;
}

export function getFieldNumber(node: GenesisNode, ...fieldKeys: string[]): number | null {
  const raw = getFieldValue(node, ...fieldKeys);
  if (raw == null || raw.trim().length === 0) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function getTitle(node: GenesisNode, ...titleFieldKeys: string[]): string | null {
  for (const key of titleFieldKeys) {
    const field = getFieldValue(node, key);
    if (field != null && field.trim().length > 0) {
      return field;
    }
  }
  const content = node.content;
  if (content != null && content.trim().length > 0) {
    return content;
  }
  return null;
}
