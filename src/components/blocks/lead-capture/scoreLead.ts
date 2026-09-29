export type LeadBucket = 'Hot' | 'Warm' | 'Cold';

export type LeadMatchKind = 'equals' | 'oneOf' | 'contains' | 'filled';

export interface LeadScoreRule {
  field: string;
  kind?: LeadMatchKind;
  value?: string;
  values?: string[];
  weight: number;
  reason?: string;
}

export interface LeadScoreThresholds {
  hot: number;
  warm: number;
}

export interface LeadScoreResult {
  bucket: LeadBucket;
  score: number;
  reasons: string[];
}

export const DEFAULT_LEAD_THRESHOLDS: LeadScoreThresholds = { hot: 60, warm: 30 };

function norm(raw: string | boolean | undefined): string {
  if (raw === true) {
    return 'true';
  }
  if (raw === false || raw == null) {
    return '';
  }
  return String(raw).trim().toLowerCase();
}

function ruleFires(rule: LeadScoreRule, values: Record<string, string | boolean>): boolean {
  const actual = norm(values[rule.field]);
  switch (rule.kind ?? 'equals') {
    case 'filled':
      return actual.length > 0 && actual !== 'false';
    case 'oneOf':
      return (rule.values ?? []).some((candidate) => norm(candidate) === actual);
    case 'contains':
      return rule.value != null && actual.includes(norm(rule.value));
    case 'equals':
    default:
      return rule.value != null && actual === norm(rule.value);
  }
}

function defaultReason(rule: LeadScoreRule): string {
  const sign = rule.weight >= 0 ? '+' : '';
  const label =
    rule.value ??
    (rule.values && rule.values.length > 0 ? rule.values.join('/') : `${rule.field} provided`);
  return `${label} (${sign}${rule.weight})`;
}

export function scoreLead(
  values: Record<string, string | boolean>,
  rules: LeadScoreRule[],
  thresholds: LeadScoreThresholds = DEFAULT_LEAD_THRESHOLDS,
): LeadScoreResult {
  let score = 0;
  const reasons: string[] = [];

  for (const rule of rules) {
    if (ruleFires(rule, values)) {
      score += rule.weight;
      reasons.push(rule.reason ?? defaultReason(rule));
    }
  }

  score = Math.max(0, score);

  const bucket: LeadBucket =
    score >= thresholds.hot ? 'Hot' : score >= thresholds.warm ? 'Warm' : 'Cold';

  return { bucket, score, reasons };
}

export const REAL_ESTATE_LEAD_RULES: LeadScoreRule[] = [
  { field: 'lenderStatus', value: 'Pre-approved', weight: 30, reason: 'Pre-approved with a lender (+30)' },
  { field: 'lenderStatus', value: 'Pre-qualified', weight: 18, reason: 'Pre-qualified (+18)' },
  { field: 'lenderStatus', value: 'Needs a lender', weight: 5, reason: 'Open to a lender intro (+5)' },
  { field: 'timeline', value: 'ASAP', weight: 25, reason: 'Ready to buy ASAP (+25)' },
  { field: 'timeline', value: '1-3 months', weight: 18, reason: 'Buying in 1-3 months (+18)' },
  { field: 'timeline', value: '3-6 months', weight: 10, reason: 'Buying in 3-6 months (+10)' },
  { field: 'timeline', value: '6-12 months', weight: 5, reason: 'Buying in 6-12 months (+5)' },
  { field: 'realtorStatus', value: 'Working with a realtor', weight: 12, reason: 'Working with a realtor (+12)' },
  { field: 'realtorStatus', value: 'Need a realtor', weight: 8, reason: 'Needs a realtor (+8)' },
  { field: 'budget', value: '$750k+', weight: 15, reason: 'Budget $750k+ (+15)' },
  { field: 'budget', value: '$500k-$750k', weight: 12, reason: 'Budget $500k-$750k (+12)' },
  { field: 'budget', value: '$250k-$500k', weight: 8, reason: 'Budget $250k-$500k (+8)' },
  { field: 'budget', value: 'Under $250k', weight: 4, reason: 'Budget under $250k (+4)' },
  { field: 'location', kind: 'filled', weight: 6, reason: 'Target location provided (+6)' },
  { field: 'homeType', kind: 'filled', weight: 4, reason: 'Home type specified (+4)' },
];

export const REAL_ESTATE_LEAD_FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Smith' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
  {
    name: 'budget',
    label: 'Budget',
    type: 'select',
    required: true,
    placeholder: 'Select a range',
    options: [
      { label: 'Under $250k', value: 'Under $250k' },
      { label: '$250k-$500k', value: '$250k-$500k' },
      { label: '$500k-$750k', value: '$500k-$750k' },
      { label: '$750k+', value: '$750k+' },
    ],
  },
  {
    name: 'homeType',
    label: 'Home Type',
    type: 'select',
    required: true,
    placeholder: 'Choose a type',
    options: [
      { label: 'Single-family', value: 'Single-family' },
      { label: 'Condo', value: 'Condo' },
      { label: 'Townhouse', value: 'Townhouse' },
      { label: 'Multi-family', value: 'Multi-family' },
      { label: 'Land', value: 'Land' },
    ],
  },
  { name: 'location', label: 'Preferred Location', type: 'text', required: true, placeholder: 'City, neighborhood, or ZIP' },
  {
    name: 'lenderStatus',
    label: 'Financing Status',
    type: 'select',
    required: true,
    placeholder: 'Where are you with financing?',
    options: [
      { label: 'Pre-approved', value: 'Pre-approved' },
      { label: 'Pre-qualified', value: 'Pre-qualified' },
      { label: 'Needs a lender', value: 'Needs a lender' },
      { label: 'Paying cash', value: 'Paying cash' },
    ],
  },
  {
    name: 'realtorStatus',
    label: 'Realtor Status',
    type: 'select',
    required: true,
    placeholder: 'Are you working with an agent?',
    options: [
      { label: 'Working with a realtor', value: 'Working with a realtor' },
      { label: 'Need a realtor', value: 'Need a realtor' },
      { label: 'Just browsing', value: 'Just browsing' },
    ],
  },
  {
    name: 'timeline',
    label: 'Buying Timeline',
    type: 'select',
    required: true,
    placeholder: 'When are you looking to buy?',
    options: [
      { label: 'ASAP', value: 'ASAP' },
      { label: '1-3 months', value: '1-3 months' },
      { label: '3-6 months', value: '3-6 months' },
      { label: '6-12 months', value: '6-12 months' },
      { label: 'Just looking', value: 'Just looking' },
    ],
  },
] as const;

export const REAL_ESTATE_LEAD_STEPS: { title: string; fields: string[] }[] = [
  { title: 'Contact', fields: ['name', 'email', 'phone'] },
  { title: 'Property', fields: ['budget', 'homeType', 'location'] },
  { title: 'Readiness', fields: ['lenderStatus', 'realtorStatus', 'timeline'] },
];

export const SCORE_LEAD_WIRING =
  'see JSDoc above for the submit -> scoreLead -> RecordsTable example';
