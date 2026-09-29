import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage, type PersistOptions } from 'zustand/middleware';

export function createPersistentStore<T>(
  name: string,
  initializer: StateCreator<T, [['zustand/persist', unknown]], []>,
  options?: Omit<PersistOptions<T>, 'name' | 'storage'>,
) {
  return create<T>()(
    persist(initializer, {
      ...options,
      name,
      storage: getDefaultStorage<T>(),
    }),
  );
}

function getDefaultStorage<T>(): PersistOptions<T>['storage'] {
  try {
    if (typeof window === 'undefined' || window.localStorage == null) {
      return undefined;
    }
  } catch {
    return undefined;
  }
  return createJSONStorage<T>(() => window.localStorage);
}
