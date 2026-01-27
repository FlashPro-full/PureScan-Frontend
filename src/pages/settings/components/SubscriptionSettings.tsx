import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../../../api/client';

interface TrialStatus {
  status: string;
  daysLeft?: number;
}

interface AccountProfile {
  account?: {
    plan?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}

const SubscriptionSettings = () => {
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [trialStatus, accountProfile] = await Promise.all([
          apiJson<TrialStatus>('/account/trial-status'),
          apiJson<AccountProfile>('/account/profile'),
        ]);
        setTrial(trialStatus);
        setProfile(accountProfile);
        setError(null);
      } catch (err) {
        console.error('[settings] failed to load subscription details', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscription status');
      }
    };

    void load();
  }, []);

  const handlePortal = useCallback(async () => {
    setLoadingPortal(true);
    setError(null);
    try {
      const response = await apiJson<{ url: string }>('/account/stripe-portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      if (response?.url) {
        window.location.href = response.url;
      } else {
        throw new Error('Stripe portal URL not provided');
      }
    } catch (err) {
      console.error('[settings] failed to open Stripe portal', err);
      setError(err instanceof Error ? err.message : 'Unable to open billing portal');
    } finally {
      setLoadingPortal(false);
    }
  }, []);

  const trialLabel = trial?.status === 'trialing'
    ? `${trial.daysLeft ?? 0} day${trial?.daysLeft === 1 ? '' : 's'} remaining`
    : trial?.status || 'inactive';

  const plan = profile?.account?.plan || 'Pro';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Subscription & Billing</h2>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-800">Subscription Level</p>
          <p className="text-base font-semibold text-gray-900">{plan}</p>
          <p className="text-xs text-gray-600 mt-1">
            Trial status: <span className="font-semibold">{trialLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePortal}
            disabled={loadingPortal}
            className="px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-sm disabled:opacity-60"
          >
            {loadingPortal ? 'Opening…' : 'Manage Billing'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-[#ED1C24]">{error}</p>}

      <div className="text-xs text-gray-500">
        Stripe customer: {profile?.account?.stripeCustomerId ?? '—'}
      </div>
    </div>
  );
};

export default SubscriptionSettings;
