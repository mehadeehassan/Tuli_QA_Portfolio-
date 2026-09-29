import type { GenesisNode } from '@/lib/genesis-data';

import type { GoalBarData } from './GoalBar';
import type { MetricCardData } from './MetricCard';

function toFiniteNumber(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export interface MetricsConfig {
  labelField: string;
  valueField: string;
  changeField?: string;
  trendField?: string;
  colorIndex?: 1 | 2 | 3 | 4 | 5;
}

export interface GoalsConfig {
  nameField: string;
  currentField: string;
  targetField: string;
  colorIndex?: 1 | 2 | 3 | 4 | 5;
}

export function nodesToMetrics(nodes: GenesisNode[], config: MetricsConfig): MetricCardData[] {
  return nodes.map((node) => {
    const fields = node.fieldValues;
    const rawTrend = config.trendField ? fields[config.trendField]?.toLowerCase() : undefined;
    return {
      label: fields[config.labelField] ?? '',
      value: fields[config.valueField] ?? '',
      change: config.changeField ? fields[config.changeField] : undefined,
      trend: rawTrend === 'up' || rawTrend === 'down' ? rawTrend : undefined,
      colorIndex: config.colorIndex,
    };
  });
}

export function nodesToGoals(nodes: GenesisNode[], config: GoalsConfig): GoalBarData[] {
  return nodes.map((node) => {
    const fields = node.fieldValues;
    return {
      name: fields[config.nameField] ?? '',
      current: toFiniteNumber(fields[config.currentField]),
      target: toFiniteNumber(fields[config.targetField]),
      colorIndex: config.colorIndex,
    };
  });
}
