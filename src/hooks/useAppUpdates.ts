import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';
import { checkStoreUpdate, startStoreUpdate } from '../services/storeUpdate';
import {
  resolveUpdateState,
  shouldShowUpdate,
  type AppUpdateState,
} from './updateState';

// Avoid re-checking on every foreground bounce.
const CHECK_THROTTLE_MS = 60_000;

export type AppUpdateStatus = {
  state: AppUpdateState;
  isVisible: boolean;
  isChecking: boolean;
  latestStoreVersion?: string;
  checkNow: () => Promise<void>;
  applyOta: () => Promise<void>;
  goToStore: () => Promise<void>;
};

export const useAppUpdates = (): AppUpdateStatus => {
  const { isUpdateAvailable, isUpdatePending, isDownloading } =
    Updates.useUpdates();

  const [storeUpdateAvailable, setStoreUpdateAvailable] = useState(false);
  const [latestStoreVersion, setLatestStoreVersion] = useState<string>();
  const [isChecking, setIsChecking] = useState(false);

  const lastCheckRef = useRef(0);
  const inFlightRef = useRef(false);
  const isMountedRef = useRef(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const checkNow = useCallback(async () => {
    if (inFlightRef.current) {return;}
    inFlightRef.current = true;
    if (isMountedRef.current) {setIsChecking(true);}
    try {
      // Kick the OTA check (updates useUpdates() reactively); tolerate failure.
      const otaCheck = Updates.isEnabled
        ? Updates.checkForUpdateAsync().catch(() => null)
        : Promise.resolve(null);

      const [, store] = await Promise.all([otaCheck, checkStoreUpdate()]);

      lastCheckRef.current = Date.now();
      if (isMountedRef.current) {
        setStoreUpdateAvailable(store.updateAvailable);
        setLatestStoreVersion(store.latestVersion);
      }
    } finally {
      inFlightRef.current = false;
      if (isMountedRef.current) {setIsChecking(false);}
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    checkNow();
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      // Only re-check on a real background/inactive -> active transition, not
      // on iOS control-center/notification flickers.
      const cameToForeground =
        appStateRef.current.match(/inactive|background/) && next === 'active';
      appStateRef.current = next;
      if (
        cameToForeground &&
        Date.now() - lastCheckRef.current > CHECK_THROTTLE_MS
      ) {
        checkNow();
      }
    });
    return () => {
      isMountedRef.current = false;
      sub.remove();
    };
  }, [checkNow]);

  // A newer OTA exists but isn't downloaded yet: fetch it so the "Downloading…"
  // state is truthful and advances to "ready to install" instead of spinning.
  useEffect(() => {
    if (
      Updates.isEnabled &&
      isUpdateAvailable &&
      !isUpdatePending &&
      !isDownloading
    ) {
      Updates.fetchUpdateAsync().catch(() => {});
    }
  }, [isUpdateAvailable, isUpdatePending, isDownloading]);

  const applyOta = useCallback(async () => {
    if (!Updates.isEnabled) {return;}
    try {
      let ready = isUpdatePending;
      if (!ready) {
        const result = await Updates.fetchUpdateAsync();
        ready = result.isNew;
      }
      if (ready) {
        await Updates.reloadAsync();
      }
    } catch {
      // Fire-and-forget from a press handler; a failed reload must not reject.
    }
  }, [isUpdatePending]);

  const goToStore = useCallback(async () => {
    try {
      await startStoreUpdate();
    } catch {
      // The store flow is best-effort; swallow to avoid an unhandled rejection.
    }
  }, []);

  const state = resolveUpdateState({
    storeUpdateAvailable,
    isOtaPending: isUpdatePending,
    isOtaAvailable: isUpdateAvailable,
  });

  return {
    state,
    isVisible: shouldShowUpdate(state),
    isChecking,
    latestStoreVersion,
    checkNow,
    applyOta,
    goToStore,
  };
};
