import { gatewayRequest, isEmptyString } from '../genesis-gateway';
import type { ClientOptions, GatewayResponse } from '../genesis-gateway';

function isFileLike(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function buildFlowBody(values: Record<string, unknown>): BodyInit {
  if (!Object.values(values).some(isFileLike)) {
    return JSON.stringify(values);
  }
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value == null) {
      continue;
    }
    if (isFileLike(value)) {
      const filename = typeof File !== 'undefined' && value instanceof File ? value.name : key;
      formData.append(key, value, filename);
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

export async function submitForm(
  flowId: string,
  values: Record<string, unknown>,
  options?: ClientOptions,
): Promise<{ flowRunId?: string }> {
  if (isEmptyString(flowId)) {
    throw new Error('Flow ID cannot be empty');
  }
  const data = await gatewayRequest<GatewayResponse<{ flowRunId: string }>>(
    `/forms/${encodeURIComponent(flowId)}/run`,
    { method: 'POST', body: buildFlowBody(values) },
    options,
  );
  return { flowRunId: data.payload?.flowRunId };
}

export async function runFlow(
  flowId: string,
  input?: Record<string, unknown>,
  options?: ClientOptions,
): Promise<{ flowRunId?: string }> {
  if (isEmptyString(flowId)) {
    throw new Error('Flow ID cannot be empty');
  }
  const data = await gatewayRequest<GatewayResponse<{ flowRunId: string }>>(
    `/webhooks/${encodeURIComponent(flowId)}/run`,
    { method: 'POST', body: buildFlowBody(input ?? {}) },
    options,
  );
  return { flowRunId: data.payload?.flowRunId };
}

export type FlowRunStatus = 'completed' | 'failed' | 'running' | 'filtered';

export interface FlowRunSummary {
  id: string;
  status: FlowRunStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FlowRunsPage {
  runs: FlowRunSummary[];
  nextCursor: string | null;
}

export async function getFlowRuns(
  flowId: string,
  page?: { limit?: number; cursor?: string },
  options?: ClientOptions,
): Promise<FlowRunsPage> {
  if (isEmptyString(flowId)) {
    throw new Error('Flow ID cannot be empty');
  }
  const params = new URLSearchParams();
  if (page?.limit != null) {
    params.set('limit', String(page.limit));
  }
  if (page?.cursor != null && page.cursor !== '') {
    params.set('cursor', page.cursor);
  }
  const query = params.toString();
  const search = query !== '' ? `?${query}` : '';
  const data = await gatewayRequest<GatewayResponse<FlowRunsPage>>(
    `/flows/${encodeURIComponent(flowId)}/runs${search}`,
    { method: 'GET' },
    options,
  );
  return { runs: data.payload?.runs ?? [], nextCursor: data.payload?.nextCursor ?? null };
}
