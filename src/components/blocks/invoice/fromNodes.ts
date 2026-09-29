import type { GenesisNode } from '@/lib/genesis-data';

import type { InvoiceCardProps, InvoiceLineItem } from './InvoiceCard';

function toFiniteNumber(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export interface InvoiceFieldMap {
  number: string;
  status: string;
  issueDate?: string;
  dueDate?: string;
  billToName: string;
  billToEmail?: string;
  billToAddress?: string;
  taxRate?: string;
  currency?: string;
  lineDescription: string;
  lineQty: string;
  lineUnitPrice: string;
}

export function nodeToInvoice(
  invoiceNode: GenesisNode,
  lineItemNodes: GenesisNode[],
  fieldMap: InvoiceFieldMap,
): InvoiceCardProps['invoice'] {
  const fields = invoiceNode.fieldValues;

  const lineItems: InvoiceLineItem[] = lineItemNodes.map((node) => {
    const lf = node.fieldValues;
    return {
      id: node.id,
      description: lf[fieldMap.lineDescription] ?? '',
      qty: toFiniteNumber(lf[fieldMap.lineQty]),
      unitPrice: toFiniteNumber(lf[fieldMap.lineUnitPrice]),
    };
  });

  return {
    id: invoiceNode.id,
    number: fields[fieldMap.number] ?? '',
    status: fields[fieldMap.status] ?? '',
    issueDate: fieldMap.issueDate ? (fields[fieldMap.issueDate] ?? '') : undefined,
    dueDate: fieldMap.dueDate ? (fields[fieldMap.dueDate] ?? '') : undefined,
    billTo: {
      name: fields[fieldMap.billToName] ?? '',
      email: fieldMap.billToEmail ? (fields[fieldMap.billToEmail] ?? undefined) : undefined,
      address: fieldMap.billToAddress ? (fields[fieldMap.billToAddress] ?? undefined) : undefined,
    },
    lineItems,
    taxRate: fieldMap.taxRate ? toFiniteNumber(fields[fieldMap.taxRate]) : undefined,
    currency: fieldMap.currency ? (fields[fieldMap.currency] ?? undefined) : undefined,
  };
}

export const SERVICE_PRO_INVOICE: InvoiceCardProps['invoice'] = {
  id: 'inv-1042',
  number: 'INV-1042',
  status: 'unpaid',
  issueDate: '2026-06-29',
  dueDate: '2026-07-13',
  billTo: {
    name: 'Maria Gomez',
    email: 'maria.gomez@example.com',
    address: '418 Sycamore Ln, Austin, TX 78704',
  },
  lineItems: [
    { id: 'li-1', description: '3-ton 16 SEER AC condenser + air handler', qty: 1, unitPrice: 3600 },
    { id: 'li-2', description: 'Install labor (2 techs, full day)', qty: 8, unitPrice: 95 },
    { id: 'li-3', description: 'Refrigerant line set + copper', qty: 1, unitPrice: 240 },
    { id: 'li-4', description: 'Smart thermostat + setup', qty: 1, unitPrice: 180 },
    { id: 'li-5', description: 'Permit + inspection fee', qty: 1, unitPrice: 120 },
  ],
  taxRate: 0.0825,
  currency: 'USD',
};
