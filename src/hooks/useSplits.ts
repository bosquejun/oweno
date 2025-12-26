'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockApi } from '../api/mockApi';
import { Group, Expense, User } from '../types';

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    
    mockApi.getGroups()
      .then(data => {
        if (!cancelled) {
          setGroups(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(() => {
    setIsLoading(true);
    mockApi.getGroups()
      .then(setGroups)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { data: groups, isLoading, error, refetch };
};

export const useGroup = (id: string) => {
  const [group, setGroup] = useState<Group | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    
    mockApi.getGroup(id)
      .then(data => {
        if (!cancelled) {
          setGroup(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data: group, isLoading, error, isError: !!error };
};

export const useExpenses = (groupId: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!groupId) return Promise.resolve();
    setIsLoading(true);
    return mockApi.getExpenses(groupId)
      .then(setExpenses)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    
    mockApi.getExpenses(groupId)
      .then(data => {
        if (!cancelled) {
          setExpenses(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  return { data: expenses, isLoading, error, refetch };
};

export const useAllExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    
    mockApi.getAllExpenses()
      .then(data => {
        if (!cancelled) {
          setExpenses(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data: expenses, isLoading, error };
};

export const useCreateGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (group: Group) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mockApi.createGroup(group);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutateAsync = mutate;

  return { mutate, mutateAsync, isLoading, error };
};

export const useUpdateGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (group: Group) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mockApi.updateGroup(group);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutateAsync = mutate;

  return { mutate, mutateAsync, isLoading, error };
};

export const useAddExpense = (groupId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (expense: Expense) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mockApi.addExpense(expense);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const mutateAsync = mutate;

  return { mutate, mutateAsync, isLoading, error };
};

export const useUpdateExpense = (groupId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (expense: Expense) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mockApi.updateExpense(expense);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const mutateAsync = mutate;

  return { mutate, mutateAsync, isLoading, error };
};

export const useDeleteExpense = (groupId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await mockApi.deleteExpense(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const mutateAsync = mutate;

  return { mutate, mutateAsync, isLoading, error };
};

export const useFriends = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    return mockApi.getFriends()
      .then(setFriends)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    
    mockApi.getFriends()
      .then(data => {
        if (!cancelled) {
          setFriends(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data: friends, isLoading, error, refetch };
};

export const useAddFriend = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (friend: User) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mockApi.addFriend(friend);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutateAsync = mutate;

  return { mutate, mutateAsync, isLoading, error };
};

export const useRemoveFriend = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await mockApi.removeFriend(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutateAsync = mutate;

  return { mutate, mutateAsync, isLoading, error };
};
