'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { subscriptionApi } from '@/lib/api/subscriptions';
import { SubscriptionBundle } from '@/types';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import CreateSubscriptionForm from '@/components/subscriptions/CreateSubscriptionForm';

function SubscriptionsPageContent() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionBundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionApi.getAll();
      setSubscriptions(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to load subscriptions. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleSubscriptionUpdate = () => {
    loadSubscriptions();
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadSubscriptions();
  };

  if (showCreateForm) {
    return (
      <ProtectedRoute>
        <LayoutWrapper>
          <div className="flex-1 overflow-y-auto px-4 py-8">
            <CreateSubscriptionForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </LayoutWrapper>
      </ProtectedRoute>
    );
  }

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive);

  return (
    <ProtectedRoute>
      <LayoutWrapper>
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  My Subscriptions
                </h1>
                <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                  Manage your subscription bundles and billing
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
              >
                + Create Subscription
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading subscriptions...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Active Subscriptions */}
                {activeSubscriptions.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
                      Active Subscriptions ({activeSubscriptions.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                      {activeSubscriptions.map(subscription => (
                        <SubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                          onUpdate={handleSubscriptionUpdate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Inactive Subscriptions */}
                {inactiveSubscriptions.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
                      Inactive Subscriptions ({inactiveSubscriptions.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                      {inactiveSubscriptions.map(subscription => (
                        <SubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                          onUpdate={handleSubscriptionUpdate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {subscriptions.length === 0 && (
                  <div className="py-8 text-center sm:py-12">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:mb-4 sm:h-16 sm:w-16">
                      <svg
                        className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
                      No subscriptions yet
                    </h3>
                    <p className="mb-4 px-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
                      Create your first subscription to get started
                    </p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 sm:px-6 sm:py-3 sm:text-base"
                    >
                      Create Subscription
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </LayoutWrapper>
    </ProtectedRoute>
  );
}

export default function SubscriptionsPage() {
  return <SubscriptionsPageContent />;
}
