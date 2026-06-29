import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns `false` on the server and during the first client render, then `true`
 * once hydrated. The recommended, lint-clean way to gate client-only UI without
 * calling setState inside an effect (which causes cascading renders).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
