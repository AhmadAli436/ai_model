'use client';

import { useState } from 'react';
import { subscriptionApi } from '@/lib/api/subscriptions';
import { CreateSubscription, BundleTier, BillingCycle } from '@/types';

interface CreateSubscriptionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PRICING: Record<
  BundleTier,
  { monthly: number; yearly: number; maxMessages: number }
> = {
  basic: { monthly: 10, yearly: 100, maxMessages: 10 },
  pro: { monthly: 50, yearly: 500, maxMessages: 100 },
  enterprise: { monthly: 200, yearly: 2000, maxMessages: -1 },
};

export default function CreateSubscriptionForm({
  onSuccess,
  onCancel,
}: CreateSubscriptionFormProps) {
  const [formData, setFormData] = useState<CreateSubscription>({
    tier: 'basic',
    billingCycle: 'monthly',
    autoRenew: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await subscriptionApi.create(formData);
      onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create subscription. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPrice =
    formData.billingCycle === 'monthly'
      ? PRICING[formData.tier].monthly
      : PRICING[formData.tier].yearly;

  const getTierColor = (tier: BundleTier) => {
    switch (tier) {
      case 'basic':
        return 'border-blue-500 bg-blue-50';
      case 'pro':
        return 'border-purple-500 bg-purple-50';
      case 'enterprise':
        return 'border-indigo-500 bg-indigo-50';
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-4 shadow-lg sm:p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
        Create New Subscription
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </div>
        )}

        {/* Tier Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 sm:mb-3">
            Select Tier
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {(['basic', 'pro', 'enterprise'] as BundleTier[]).map(tier => (
              <button
                key={tier}
                type="button"
                onClick={() => setFormData({ ...formData, tier })}
                className={`rounded-lg border-2 p-3 transition sm:p-4 ${
                  formData.tier === tier
                    ? getTierColor(tier)
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <h3 className="mb-1 text-sm font-semibold capitalize text-gray-900 sm:text-base">
                    {tier}
                  </h3>
                  <p className="text-xs text-gray-600 sm:text-sm">
                    {PRICING[tier].maxMessages === -1
                      ? 'Unlimited'
                      : `${PRICING[tier].maxMessages} messages`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Billing Cycle */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 sm:mb-3">
            Billing Cycle
          </label>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {(['monthly', 'yearly'] as BillingCycle[]).map(cycle => (
              <button
                key={cycle}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, billingCycle: cycle })
                }
                className={`rounded-lg border-2 p-3 transition sm:p-4 ${
                  formData.billingCycle === cycle
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <h3 className="mb-1 text-sm font-semibold capitalize text-gray-900 sm:text-base">
                    {cycle}
                  </h3>
                  <p className="text-xs text-gray-600 sm:text-sm">
                    {cycle === 'monthly'
                      ? `$${PRICING[formData.tier].monthly}/month`
                      : `$${PRICING[formData.tier].yearly}/year`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Auto-renew */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="checkbox"
            id="autoRenew"
            checked={formData.autoRenew}
            onChange={e =>
              setFormData({ ...formData, autoRenew: e.target.checked })
            }
            className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label
            htmlFor="autoRenew"
            className="text-xs font-medium text-gray-700 sm:text-sm"
          >
            Enable auto-renewal
          </label>
        </div>

        {/* Price Summary */}
        <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 sm:text-sm">
              Total Price:
            </span>
            <span className="text-xl font-bold text-gray-900 sm:text-2xl">
              ${selectedPrice.toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formData.billingCycle === 'monthly'
              ? 'Billed monthly'
              : 'Billed annually'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300 sm:py-3 sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
          >
            {isLoading ? 'Creating...' : 'Create Subscription'}
          </button>
        </div>
      </form>
    </div>
  );
}
