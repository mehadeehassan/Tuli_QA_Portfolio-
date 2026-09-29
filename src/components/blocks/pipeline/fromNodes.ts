import type { GenesisNode } from '@/lib/genesis-data';

import type { PipelineCard, PipelineStage } from './PipelineBoard';

export interface PipelineConfig {
  statusField: string;
  titleField: string;
  subtitleField?: string;
  metaFields?: string[];
  metaLabels?: Record<string, string>;
}

export function nodesToCards(nodes: GenesisNode[], config: PipelineConfig): PipelineCard[] {
  return nodes.map((node) => {
    const fields = node.fieldValues;
    const meta = (config.metaFields ?? [])
      .map((key) => ({
        label: config.metaLabels?.[key] ?? key,
        value: fields[key] ?? '',
      }))
      .filter((entry) => entry.value !== '');

    return {
      id: node.id,
      title: fields[config.titleField] ?? '',
      subtitle: config.subtitleField ? fields[config.subtitleField] : undefined,
      stageId: fields[config.statusField] ?? '',
      meta: meta.length > 0 ? meta : undefined,
    };
  });
}

export function toStages(stageIds: string[], labels?: Record<string, string>): PipelineStage[] {
  return stageIds.map((id, i) => ({
    id,
    label: labels?.[id] ?? id,
    colorIndex: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  }));
}
