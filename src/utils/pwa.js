// Platform detection for the PWA install prompt. Pure helpers, no React.

const TWA_FLAG_KEY = 'pwa_is_twa';

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent || '');

export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  // iPadOS 13+ reports itself as a Mac; touch support gives it away
  return /iPhone|iPad|iPod/i.test(ua()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isAndroid() {
  return /Android/i.test(ua());
}

export function isMobile() {
  return isIOS() || isAndroid();
}

export function isIPad() {
  return /iPad/i.test(ua()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// WebViews inside WhatsApp, Instagram, Facebook etc. can't install a PWA
export function isInAppBrowser() {
  return /FBAN|FBAV|Instagram|Line\/|WhatsApp|; wv\)/i.test(ua());
}

// Safari, or another iOS browser (all WebKit) identified by its UA token
export function getIOSBrowser() {
  const agent = ua();
  if (/CriOS/i.test(agent)) return 'chrome';
  if (/EdgiOS/i.test(agent)) return 'edge';
  if (/FxiOS/i.test(agent)) return 'firefox';
  return 'safari';
}

export function getIOSVersion() {
  const match = ua().match(/OS (\d+)_(\d+)/i);
  if (!match) return null;
  return parseFloat(`${match[1]}.${match[2]}`);
}

// Before iOS 16.4 only Safari could add a web app to the Home Screen
export function iosNeedsSafari() {
  if (!isIOS() || getIOSBrowser() === 'safari') return false;
  const version = getIOSVersion();
  return version !== null && version < 16.4;
}

// The Android APK (TWA) opens the site with an android-app:// referrer on the first
// page only, so remember it for reloads. sessionStorage, not localStorage: the TWA
// shares Chrome's storage, and a persistent flag would mark normal Chrome tabs too.
export function isTWA() {
  try {
    if (document.referrer?.startsWith('android-app://')) {
      sessionStorage.setItem(TWA_FLAG_KEY, 'true');
      return true;
    }
    return sessionStorage.getItem(TWA_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

// True when running as an installed app: home-screen PWA, iOS web app or the APK
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true ||
    isTWA()
  );
}

// How the app is running when installed: "twa" (Android APK), "ios" (Home Screen web
// app) or "pwa" (installed PWA). null in a normal browser tab.
export function getInstalledMode() {
  if (!isStandalone()) return null;
  if (isTWA()) return 'twa';
  if (window.navigator.standalone === true || isIOS()) return 'ios';
  return 'pwa';
}

// Android Chrome: reports the PWA or the APK when either is installed (declared in
// the manifest's related_applications). Unsupported elsewhere → false.
export async function hasInstalledRelatedApp() {
  try {
    if (!navigator.getInstalledRelatedApps) return false;
    const apps = await navigator.getInstalledRelatedApps();
    return apps.length > 0;
  } catch {
    return false;
  }
}
