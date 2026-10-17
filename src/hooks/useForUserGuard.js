import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import userStore from '@stores/UserStore';
import { isForOtherAccount, PUSH_CLICK_PARAMS, NOTIFICATION_PANEL_PARAMS } from '@utils/pushNotification';

// Handles push notification clicks on a shared browser: if the notification was for a
// different account than the one logged in, offer to switch accounts instead of
// opening the target as the wrong user.
export default function useForUserGuard() {
  const { user, logOut } = userStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasForUser = searchParams.has('forUser');
  const isMismatch = isForOtherAccount(searchParams, user?._id);

  const clearParams = useCallback(
    (names) => {
      const next = new URLSearchParams(searchParams);
      names.forEach((name) => next.delete(name));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Notification is for this account: nothing to ask, just tidy the URL.
  useEffect(() => {
    if (user && hasForUser && !isMismatch) clearParams(PUSH_CLICK_PARAMS);
  }, [user, hasForUser, isMismatch, clearParams]);

  const dismiss = useCallback(() => {
    clearParams([...PUSH_CLICK_PARAMS, ...NOTIFICATION_PANEL_PARAMS]);
  }, [clearParams]);

  // Logging out keeps every account's push link on this browser (see UserStore.logOut).
  const switchAccount = useCallback(async () => {
    await logOut();
    window.location.replace('/auth/login');
  }, [logOut]);

  return {
    showPrompt: isMismatch,
    accountName: searchParams.get('forAccount') || 'another account',
    dismiss,
    switchAccount,
  };
}
