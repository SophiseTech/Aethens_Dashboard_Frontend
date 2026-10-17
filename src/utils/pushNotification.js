// A push notification click opens the app with ?forUser=<id>[,<id>...] (see
// public/sw-push.js). True when that notification belongs to other account(s) than
// the one logged in on this shared browser.
export function isForOtherAccount(searchParams, userId) {
  const forUser = searchParams.get('forUser');
  if (!forUser || !userId) return false;
  return !forUser.split(',').includes(String(userId));
}

export const PUSH_CLICK_PARAMS = ['forUser', 'forAccount'];
export const NOTIFICATION_PANEL_PARAMS = ['notifications', 'openNotifications'];
