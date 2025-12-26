'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Invite {
  id: string;
  email: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  groupId?: string;
  group?: {
    id: string;
    name: string;
    description?: string;
  };
  inviter: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
  invitee?: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
  expiresAt?: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface CreateInviteInput {
  email: string;
  groupId?: string;
  expiresInDays?: number;
}

export const useInvites = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/invites');
      if (!response.ok) {
        throw new Error('Failed to fetch invites');
      }
      const data = await response.json();
      setInvites(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invites'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return {
    data: invites,
    isLoading,
    error,
    refetch: fetchInvites,
  };
};

export const useCreateInvite = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (input: CreateInviteInput) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invite');
      }
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create invite');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
    error,
  };
};

export const useAcceptInvite = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (token: string) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/invites/accept/${token}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invite');
      }
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to accept invite');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
    error,
  };
};

export const useCancelInvite = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (inviteId: string) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel invite');
      }
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel invite');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
    error,
  };
};

export const useResendInvite = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (inviteId: string) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend invite');
      }
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resend invite');
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
    error,
  };
};
