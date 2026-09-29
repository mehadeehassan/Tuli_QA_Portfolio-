import { gatewayGetIfChanged, gatewayRequest, isEmptyString } from '../genesis-gateway';
import type { ClientOptions, GatewayResponse } from '../genesis-gateway';

export interface GenesisNode {
  id: string;
  fieldValues: Record<string, string>;
  parentId: string | null;
  content?: string;
}

export type NewNodeFields = Record<string, string | number | boolean> & { parentId?: string };

export async function getNodes(projectId: string, options?: ClientOptions): Promise<GenesisNode[]> {
  if (isEmptyString(projectId)) {
    throw new Error('Project ID cannot be empty');
  }
  const data = await gatewayRequest<GatewayResponse<{ nodes: GenesisNode[] }>>(
    `/projects/${encodeURIComponent(projectId)}/nodes`,
    { method: 'GET' },
    options,
  );
  return data.payload?.nodes ?? [];
}

export type NodesIfChanged =
  | { changed: false; etag: string | null }
  | { changed: true; etag: string | null; nodes: GenesisNode[] };

export async function getNodesIfChanged(
  projectId: string,
  etag: string | null,
  options?: ClientOptions,
): Promise<NodesIfChanged> {
  if (isEmptyString(projectId)) {
    throw new Error('Project ID cannot be empty');
  }
  const result = await gatewayGetIfChanged<GatewayResponse<{ nodes: GenesisNode[] }>>(
    `/projects/${encodeURIComponent(projectId)}/nodes`,
    etag,
    options,
  );
  if (!result.changed) {
    return { changed: false, etag: result.etag };
  }
  return { changed: true, etag: result.etag, nodes: result.body.payload?.nodes ?? [] };
}

export type WriteResult = {
  id: string | null;
  ignoredKeys: string[];
};

type WritePayload = { node?: { id?: string }; ignoredKeys?: string[] };

function readWriteResult(data: GatewayResponse<WritePayload> | undefined): WriteResult {
  const id = data?.payload?.node?.id;
  const ignoredKeys = data?.payload?.ignoredKeys;
  return {
    id: typeof id === 'string' && id !== '' ? id : null,
    ignoredKeys: Array.isArray(ignoredKeys)
      ? ignoredKeys.filter((key): key is string => typeof key === 'string')
      : [],
  };
}

export async function createNode(
  projectId: string,
  fields: NewNodeFields,
  options?: ClientOptions,
): Promise<WriteResult> {
  if (isEmptyString(projectId)) {
    throw new Error('Project ID cannot be empty');
  }
  const data = await gatewayRequest<GatewayResponse<WritePayload>>(
    `/projects/${encodeURIComponent(projectId)}/nodes`,
    { method: 'POST', body: JSON.stringify(fields) },
    options,
  );
  return readWriteResult(data);
}

export async function updateNode(
  projectId: string,
  nodeId: string,
  fields: Record<string, string | number | boolean>,
  options?: ClientOptions,
): Promise<WriteResult> {
  if (isEmptyString(projectId) || isEmptyString(nodeId)) {
    throw new Error('Project ID and node ID cannot be empty');
  }
  const data = await gatewayRequest<GatewayResponse<WritePayload>>(
    `/projects/${encodeURIComponent(projectId)}/nodes/${encodeURIComponent(nodeId)}`,
    { method: 'PATCH', body: JSON.stringify(fields) },
    options,
  );
  return readWriteResult(data);
}

export async function deleteNode(
  projectId: string,
  nodeId: string,
  options?: ClientOptions,
): Promise<void> {
  if (isEmptyString(projectId) || isEmptyString(nodeId)) {
    throw new Error('Project ID and node ID cannot be empty');
  }
  await gatewayRequest(
    `/projects/${encodeURIComponent(projectId)}/nodes/${encodeURIComponent(nodeId)}`,
    { method: 'DELETE' },
    options,
  );
}
