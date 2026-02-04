import { useCallback, useEffect, useRef, useState } from 'react';

type IdleTimeoutOptions = {
  warningMs?: number;
  timeoutMs?: number;
  channelName?: string;
};

/**
 * Triggers `onIdle` after inactivity.
 * Also emits/consumes activity pings via BroadcastChannel + localStorage so all tabs share the timer.
 * Returns a flag when the warning window is active and an acknowledge handler to keep the session alive.
 */
export function useIdleTimeout(
  onIdle: () => void,
  {
    warningMs = 13 * 60 * 1000, // 13 minutes
    timeoutMs = 15 * 60 * 1000, // 15 minutes
    channelName = 'idle-timeout-sync',
  }: IdleTimeoutOptions = {}
) {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivity = useRef<number>(Date.now());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const STORAGE_KEY = 'idle-timeout-last-activity';

  const clearTimers = () => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  const scheduleTimers = useCallback(
    (origin: 'self' | 'external' = 'self') => {
      clearTimers();
      setShowWarning(false);

      warningTimer.current = setTimeout(() => {
        setShowWarning(true);
      }, warningMs);

      logoutTimer.current = setTimeout(() => {
        onIdle();
      }, timeoutMs);

      // Broadcast only if this tab originated the activity
      if (origin === 'self') {
        const now = Date.now();
        localStorage.setItem(STORAGE_KEY, String(now));
        channelRef.current?.postMessage({ type: 'activity', ts: now });
        lastActivity.current = now;
      }
    },
    [onIdle, timeoutMs, warningMs]
  );

  const handleActivity = useCallback(() => {
    // Ignore when tab is hidden; we'll resync on visibilitychange
    if (document.hidden) return;
    scheduleTimers('self');
  }, [scheduleTimers]);

  const acknowledgeWarning = useCallback(() => {
    handleActivity();
  }, [handleActivity]);

  useEffect(() => {
    // Set up BroadcastChannel + storage listener for cross-tab sync
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    const onChannelMessage = (event: MessageEvent) => {
      if (event.data?.type === 'activity') {
        const ts = Number(event.data.ts || 0);
        if (ts > lastActivity.current) {
          lastActivity.current = ts;
          scheduleTimers('external');
        }
      }
    };

    channel.addEventListener('message', onChannelMessage);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const ts = Number(e.newValue);
        if (ts > lastActivity.current) {
          lastActivity.current = ts;
          scheduleTimers('external');
        }
      }
    };
    window.addEventListener('storage', onStorage);

    // Attach activity listeners
    const events: (keyof DocumentEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'visibilitychange',
      'click',
    ];
    events.forEach((evt) => document.addEventListener(evt, handleActivity, true));

    // Kick off timers on mount
    scheduleTimers('self');

    return () => {
      clearTimers();
      channel.removeEventListener('message', onChannelMessage);
      channel.close();
      window.removeEventListener('storage', onStorage);
      events.forEach((evt) =>
        document.removeEventListener(evt, handleActivity, true)
      );
    };
  }, [channelName, handleActivity, scheduleTimers]);

  return { showWarning, acknowledgeWarning };
}

