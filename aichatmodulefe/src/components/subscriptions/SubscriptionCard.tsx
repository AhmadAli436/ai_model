'use client';

import { SubscriptionBundle } from '@/types';
import { subscriptionApi } from '@/lib/api/subscriptions';
import { useState } from 'react';

interface SubscriptionCardProps {
  subscription: SubscriptionBundle;
  onUpdate: () => void;
}

export default function SubscriptionCard({
  subscription,
  onUpdate,
}: SubscriptionCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierDisplay = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getUsagePercentage = () => {
    if (subscription.maxMessages === -1) return 0; // Unlimited
    return Math.min(
      (subscription.messagesUsed / subscription.maxMessages) * 100,
      100
    );
  };

  const handleCancel = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel this subscription? It will remain active until the end date but will not auto-renew.'
      )
    ) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      await subscriptionApi.cancel(subscription.id);
      onUpdate();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to cancel subscription. Please try again.';
      setError(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold sm:px-3 sm:text-sm ${getTierColor(
                subscription.tier
              )}`}
            >
              {getTierDisplay(subscription.tier)}
            </span>
            {subscription.isActive ? (
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 sm:px-3 sm:text-sm">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 sm:px-3 sm:text-sm">
                Inactive
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
            {getTierDisplay(subscription.tier)} Plan
          </h3>
          <p className="text-xs capitalize text-gray-600 sm:text-sm">
            {subscription.billingCycle} billing
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xl font-bold text-gray-900 sm:text-2xl">
            ${subscription.price.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            /{subscription.billingCycle === 'monthly' ? 'month' : 'year'}
          </p>
        </div>
      </div>

      {/* Usage */}
      <div className="mb-4">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <span className="text-xs font-medium text-gray-700 sm:text-sm">
            Usage
          </span>
          <span className="text-xs text-gray-600 sm:text-sm">
            {subscription.messagesUsed} /{' '}
            {subscription.maxMessages === -1 ? '∞' : subscription.maxMessages}{' '}
            messages
          </span>
        </div>
        {subscription.maxMessages !== -1 && (
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all ${
                getUsagePercentage() >= 90
                  ? 'bg-red-500'
                  : getUsagePercentage() >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${getUsagePercentage()}%` }}
            />
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="mb-4 space-y-2 text-xs sm:text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
          <span className="text-gray-600">Start Date:</span>
          <span className="text-right font-medium text-gray-900 sm:text-left">
            {formatDate(subscription.startDate)}
          </span>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
          <span className="text-gray-600">End Date:</span>
          <span className="text-right font-medium text-gray-900 sm:text-left">
            {formatDate(subscription.endDate)}
          </span>
        </div>
        {subscription.autoRenew && subscription.renewalDate && (
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
            <span className="text-gray-600">Renewal Date:</span>
            <span className="text-right font-medium text-gray-900 sm:text-left">
              {formatDate(subscription.renewalDate)}
            </span>
          </div>
        )}
      </div>

      {/* Auto-renew status */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`h-2.5 w-2.5 flex-shrink-0 rounded-full sm:h-3 sm:w-3 ${
              subscription.autoRenew ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-xs text-gray-700 sm:text-sm">
            Auto-renew: {subscription.autoRenew ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      {subscription.isActive && subscription.autoRenew && (
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 sm:text-base"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      )}
    </div>
  );
}
