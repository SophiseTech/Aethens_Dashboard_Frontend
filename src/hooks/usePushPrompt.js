import { useState, useEffect, useRef, useCallback } from 'react';
import pushNotificationService from '@services/PushNotificationService';
import userStore from '@stores/UserStore';

const STORAGE_KEY_PERMANENT = 'push_prompt_permanently_dismissed';
const STORAGE_KEY_UNTIL = 'push_prompt_dismissed_until';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const PROMPT_DELAY_MS = 30000;

export default function usePushPrompt() {
  const { user } = userStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const checkEligibilityAndSchedule = useCallback(async () => {
    if (!user || !pushNotificationService.isPushSupported()) {
      return;
    }

    const permission = pushNotificationService.getPermissionState();

    if (permission === 'granted') {
      try {
        const sub = await pushNotificationService.getCurrentSubscription();
        if (!sub) {
          await pushNotificationService.silentAutoResubscribe();
        }
      } catch {
        // Silent failure for auto-resubscription
      }
      return;
    }

    if (permission === 'denied') {
      return;
    }

    try {
      const isPermanentlyDismissed = localStorage.getItem(STORAGE_KEY_PERMANENT) === 'true';
      if (isPermanentlyDismissed) return;

      const dismissedUntilStr = localStorage.getItem(STORAGE_KEY_UNTIL);
      if (dismissedUntilStr && Date.now() < parseInt(dismissedUntilStr, 10)) {
        return;
      }
    } catch {
      // LocalStorage access failure fallback
    }

    try {
      const backendStatus = await pushNotificationService.getPromptStatus();
      if (backendStatus?.pushPromptDismissed) {
        try {
          localStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
        } catch {
          // Ignore storage quota
        }
        return;
      }

      if (backendStatus?.hasActiveSubscription) {
        return;
      }

      if (backendStatus?.lastPushPromptDismissedAt) {
        const lastDismissedMs = new Date(backendStatus.lastPushPromptDismissedAt).getTime();
        const nextEligibleMs = lastDismissedMs + SEVEN_DAYS_MS;
        if (Date.now() < nextEligibleMs) {
          try {
            localStorage.setItem(STORAGE_KEY_UNTIL, nextEligibleMs.toString());
          } catch {
            // Ignore storage quota
          }
          return;
        }
      }
    } catch {
      // Network failure, continue with local decision
    }

    timerRef.current = setTimeout(async () => {
      const currentPermission = pushNotificationService.getPermissionState();
      if (currentPermission !== 'default') return;

      const sub = await pushNotificationService.getCurrentSubscription();
      if (!sub) {
        setShowPrompt(true);
      }
    }, PROMPT_DELAY_MS);
  }, [user]);

  useEffect(() => {
    checkEligibilityAndSchedule();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [checkEligibilityAndSchedule]);

  const dismiss = useCallback(async (permanent = false) => {
    setShowPrompt(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      if (permanent) {
        localStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
      } else {
        const nextEligibleMs = Date.now() + SEVEN_DAYS_MS;
        localStorage.setItem(STORAGE_KEY_UNTIL, nextEligibleMs.toString());
      }
    } catch {
      // Ignore storage error
    }

    try {
      await pushNotificationService.dismissPrompt({ permanent });
    } catch {
      // Backend sync error fallback
    }
  }, []);

  const subscribe = useCallback(async () => {
    setLoading(true);
    try {
      await pushNotificationService.subscribeDevice();
      setShowPrompt(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    showPrompt,
    loading,
    dismiss,
    subscribe,
  };
}
