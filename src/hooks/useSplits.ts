'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../api/mockApi';
import { Group, Expense, User } from '../types';

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: mockApi.getGroups
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => mockApi.getGroup(id),
    enabled: !!id
  });
};

export const useExpenses = (groupId: string) => {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => mockApi.getExpenses(groupId),
    enabled: !!groupId
  });
};

export const useAllExpenses = () => {
  return useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: mockApi.getAllExpenses
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.updateGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', data.id] });
    }
  });
};

export const useAddExpense = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useUpdateExpense = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useDeleteExpense = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

// Friends Hooks
export const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: mockApi.getFriends
  });
};

export const useAddFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.addFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });
};

