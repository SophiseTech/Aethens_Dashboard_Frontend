import { create } from "zustand";
import { isStandalone, isIOS, getInstalledMode } from "@utils/pwa";
import userService from "@services/User";

const APP_USAGE_REPORTED_KEY = 'app_usage_reported';

const pwaInstallStore = create((set, get) => ({
  // Chrome's beforeinstallprompt event; single-use, null once used or never fired
  deferredPrompt: null,
  installed: false,
  installPromptVisible: false,

  setInstallPromptVisible: (visible) => set({ installPromptVisible: visible }),

  // Records that this user opened the installed app; at most once a day per device and user
  reportAppOpen: async (userId) => {
    const mode = getInstalledMode();
    if (!mode || !userId) return;

    const marker = `${userId}:${new Date().toDateString()}`;
    try {
      if (localStorage.getItem(APP_USAGE_REPORTED_KEY) === marker) return;
      localStorage.setItem(APP_USAGE_REPORTED_KEY, marker);
    } catch {
      // Storage blocked: report anyway
    }

    await userService.recordAppUsage({ event: 'open', mode, platform: isIOS() ? 'ios' : 'android' });
  },

  promptInstall: async () => {
    const { deferredPrompt } = get();
    if (!deferredPrompt) return 'unavailable';
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    set({ deferredPrompt: null, installed: outcome === 'accepted' });
    return outcome;
  },
}));

// Must run before React renders: Chrome fires beforeinstallprompt early in page load.
export function initPwaInstallListeners() {
  if (typeof window === 'undefined') return;

  // Records the APK (TWA) referrer while it is still present on the first page
  isStandalone();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    pwaInstallStore.setState({ deferredPrompt: event });
  });

  window.addEventListener('appinstalled', () => {
    pwaInstallStore.setState({ installed: true, deferredPrompt: null });
    userService.recordAppUsage({ event: 'installed' });
  });
}

export default pwaInstallStore;
