import { create } from "zustand";
import { isStandalone } from "@utils/pwa";

const pwaInstallStore = create((set, get) => ({
  // Chrome's beforeinstallprompt event; single-use, null once used or never fired
  deferredPrompt: null,
  installed: false,
  installPromptVisible: false,

  setInstallPromptVisible: (visible) => set({ installPromptVisible: visible }),

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
  });
}

export default pwaInstallStore;
