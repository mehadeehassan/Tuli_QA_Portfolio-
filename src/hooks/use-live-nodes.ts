import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { createLiveNodes, type LiveNodesState } from '@/lib/genesis-data/live';

export interface UseLiveNodesOptions {
  refreshEveryMs?: number;
  minGapOnReturnMs?: number;
}

export interface UseLiveNodesResult extends LiveNodesState {
  refresh: () => Promise<void>;
}

const IDLE: LiveNodesState = { nodes: [], loading: false, error: null, updatedAt: null };
const noopRefresh = async () => {};

export function useLiveNodes(
  projectId: string | null | undefined,
  options: UseLiveNodesOptions = {},
): UseLiveNodesResult {
  const { refreshEveryMs, minGapOnReturnMs } = options;
  const live = useMemo(
    () =>
      projectId == null || projectId === ''
        ? null
        : createLiveNodes(projectId, { refreshEveryMs, minGapOnReturnMs }),
    [projectId, refreshEveryMs, minGapOnReturnMs],
  );

  useEffect(() => {
    if (live == null) {
      return;
    }
    live.start();
    return () => live.stop();
  }, [live]);

  const getSnapshot = live == null ? () => IDLE : live.getSnapshot;
  const subscribe = live == null ? () => () => {} : live.subscribe;
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return { ...state, refresh: live == null ? noopRefresh : live.refresh };
}
