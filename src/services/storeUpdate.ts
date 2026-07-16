import { Linking, Platform } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
  type StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import { CURRENT_APP_VERSION, STORE_URL } from '../constants/appUpdate';

const openStoreListing = () => {
  if (STORE_URL) {
    Linking.openURL(STORE_URL).catch(() => {});
  }
};

export type StoreCheckResult = {
  updateAvailable: boolean;
  latestVersion?: string;
};

// Lazily constructed so an OTA bundle landing on a binary without the native
// module degrades gracefully (no store updates) instead of crashing at import.
let instance: SpInAppUpdates | null | undefined;
const getInAppUpdates = (): SpInAppUpdates | null => {
  if (instance === undefined) {
    try {
      // isDebug=true logs to the native console; keep it tied to __DEV__.
      instance = new SpInAppUpdates(__DEV__);
    } catch {
      instance = null;
    }
  }
  return instance;
};

/**
 * Detects a newer native binary on the store.
 * iOS: iTunes lookup (via Siren) compared against curVersion.
 * Android: Play Core, which reads the installed versionCode natively.
 */
export const checkStoreUpdate = async (): Promise<StoreCheckResult> => {
  const inAppUpdates = getInAppUpdates();
  if (!inAppUpdates) {
    return { updateAvailable: false };
  }
  try {
    const result = await inAppUpdates.checkNeedsUpdate({
      curVersion: CURRENT_APP_VERSION,
    });
    return {
      updateAvailable: Boolean(result?.shouldUpdate),
      latestVersion: result?.storeVersion
        ? String(result.storeVersion)
        : undefined,
    };
  } catch {
    // Store lookup is best-effort; never surface an update on failure.
    return { updateAvailable: false };
  }
};

/**
 * iOS: opens the App Store product page (Siren alert → store).
 * Android: launches Play Core's immediate in-app update flow.
 */
export const startStoreUpdate = async (): Promise<void> => {
  const inAppUpdates = getInAppUpdates();
  // Native module missing (e.g. OTA'd onto an old binary) → open the store page.
  if (!inAppUpdates) {
    openStoreListing();
    return;
  }
  const options: StartUpdateOptions =
    Platform.OS === 'android' ? { updateType: IAUUpdateKind.IMMEDIATE } : {};
  try {
    await inAppUpdates.startUpdate(options);
  } catch {
    // If the in-app flow (Siren/Play Core) fails, fall back to the store page
    // so the user is never left with a dead tap.
    openStoreListing();
  }
};
