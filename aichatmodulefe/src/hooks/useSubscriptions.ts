import { useState, useEffect } from 'react';
import {
  subscriptionApi,
  SubscriptionBundle,
  CreateSubscription,
} from '../lib/api/subscriptions';
import { handleApiError } from '../lib/utils/errors';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionBundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await subscriptionApi.getAll();
      setSubscriptions(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (data: CreateSubscription) => {
    setLoading(true);
    setError(null);

    try {
      const newSubscription = await subscriptionApi.create(data);
      setSubscriptions(prev => [newSubscription, ...prev]);
      return newSubscription;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await subscriptionApi.cancel(subscriptionId);
      setSubscriptions(prev =>
        prev.map(sub => (sub.id === updated.id ? updated : sub))
      );
      return updated;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    createSubscription,
    cancelSubscription,
    refresh: loadSubscriptions,
  };
}
