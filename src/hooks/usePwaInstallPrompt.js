import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import userStore from '@stores/UserStore';
import pwaInstallStore from '@stores/PwaInstallStore';
import {
  isMobile,
  isIOS,
  isIPad,
  isStandalone,
  isInAppBrowser,
  getIOSBrowser,
  iosNeedsSafari,
  hasInstalledRelatedApp,
} from '@utils/pwa';

const STORAGE_KEY_PERMANENT = 'pwa_install_prompt_permanently_dismissed';
const STORAGE_KEY_UNTIL = 'pwa_install_prompt_dismissed_until';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// Gives Chrome time to fire beforeinstallprompt before falling back to manual steps
const PROMPT_DELAY_MS = 3000;
// iOS can't one-tap install, so wait for an engaged user: a navigation or this long
const IOS_ENGAGED_DELAY_MS = 15000;

function isDismissed() {
  try {
    if (localStorage.getItem(STORAGE_KEY_PERMANENT) === 'true') return true;
    const until = localStorage.getItem(STORAGE_KEY_UNTIL);
    return Boolean(until) && Date.now() < parseInt(until, 10);
  } catch {
    return false;
  }
}

function getMode(deferredPrompt) {
  if (isInAppBrowser()) return 'in-app';
  if (deferredPrompt) return 'native';
  if (isIOS()) return 'ios';
  return 'android-manual';
}

export default function usePwaInstallPrompt() {
  const { user } = userStore();
  const { deferredPrompt, installed, promptInstall, setInstallPromptVisible } = pwaInstallStore();
  const { pathname } = useLocation();
  const [eligible, setEligible] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const firstPathRef = useRef(pathname);

  // Eligibility: logged in, mobile browser, not installed, not dismissed
  useEffect(() => {
    if (!user || !isMobile() || isStandalone() || isDismissed()) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (await hasInstalledRelatedApp()) return;
      if (!cancelled) setEligible(true);
    }, PROMPT_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [user]);

  // iOS: engaged once the user navigates away from the first page or stays a while
  useEffect(() => {
    if (pathname !== firstPathRef.current) setEngaged(true);
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setEngaged(true), IOS_ENGAGED_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!eligible || installed) return;
    if (isIOS() && !engaged) return;
    setShowPrompt(true);
  }, [eligible, installed, engaged]);

  useEffect(() => {
    if (installed) setShowPrompt(false);
  }, [installed]);

  useEffect(() => {
    setInstallPromptVisible(showPrompt);
  }, [showPrompt, setInstallPromptVisible]);

  const dismiss = useCallback((permanent = false) => {
    setShowPrompt(false);
    setEligible(false);
    try {
      if (permanent) {
        localStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
      } else {
        localStorage.setItem(STORAGE_KEY_UNTIL, (Date.now() + SEVEN_DAYS_MS).toString());
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const install = useCallback(async () => {
    setLoading(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setShowPrompt(false);
      } else if (outcome === 'dismissed') {
        dismiss(false);
      }
      return outcome;
    } finally {
      setLoading(false);
    }
  }, [promptInstall, dismiss]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    showPrompt,
    mode: getMode(deferredPrompt),
    iosBrowser: getIOSBrowser(),
    isIPad: isIPad(),
    needsSafari: iosNeedsSafari(),
    loading,
    install,
    dismiss,
    copyLink,
  };
}
