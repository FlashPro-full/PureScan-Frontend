import { useCallback, useEffect, useState } from 'react';
import { apiFetch, apiJson } from '../api/client';

type TrialStatusResponse = {
  status: string;
  daysLeft?: number;
};

const DISMISS_PREFIX = 'trial-dismissed:';

export function useTrialReminder(email?: string | null) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const cacheKey = `${DISMISS_PREFIX}${email || 'self'}`;

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const data = await apiJson<TrialStatusResponse>('/account/trial-status');
        if (cancelled) return;

        if (data?.status === 'trialing' && typeof data.daysLeft === 'number' && data.daysLeft >= 0) {
          const today = new Date().toISOString().slice(0, 10);
          const dismissedOn = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
          setDaysLeft(data.daysLeft);
          setShowToast(dismissedOn !== today);
        } else {
          setDaysLeft(null);
          setShowToast(false);
        }
      } catch (error) {
        console.warn('[trialReminder] failed to load trial status', error);
        setShowToast(false);
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  const dismiss = useCallback(async () => {
    setShowToast(false);
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, today);
      }
      await apiFetch('/account/acknowledge-trial', { method: 'POST' });
    } catch (error) {
      console.warn('[trialReminder] failed to acknowledge trial', error);
    }
  }, [cacheKey]);

  return {
    daysLeft,
    showToast,
    dismiss,
  } as const;
}
