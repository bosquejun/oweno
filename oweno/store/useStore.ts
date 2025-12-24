
import { create } from 'zustand';
import { User, Group, Expense, SplitType } from '../types';

interface AppState {
  currentUser: User;
  groups: Group[];
  expenses: Expense[];
  
  // Actions
  addGroup: (group: Group) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  
  // Helper Selectors
  getGroup: (id: string) => Group | undefined;
  getGroupExpenses: (groupId: string) => Expense[];
}

// Mock initial data
const INITIAL_USER: User = {
  id: 'u1',
  name: 'Kai',
  email: 'kai@splitease.ph',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=b6e3f4'
};

const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'BGC Staycation',
    description: 'Weekend getaway with the group.',
    createdAt: new Date(),
    members: [
      INITIAL_USER,
      { id: 'u2', name: 'Miguel', email: 'miggy@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel' },
      { id: 'u3', name: 'Sammie', email: 'sammie@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sammie' }
    ]
  },
  {
    id: 'g2',
    name: 'Condo Unit 402',
    description: 'Shared utilities and monthly rent.',
    createdAt: new Date(),
    members: [
      INITIAL_USER,
      { id: 'u2', name: 'Miguel', email: 'miggy@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel' }
    ]
  }
];

export const useStore = create<AppState>((set, get) => ({
  currentUser: INITIAL_USER,
  groups: INITIAL_GROUPS,
  expenses: [],

  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  
  removeExpense: (id) => set((state) => ({ 
    expenses: state.expenses.filter(e => e.id !== id) 
  })),

  getGroup: (id) => get().groups.find(g => g.id === id),
  
  getGroupExpenses: (groupId) => get().expenses.filter(e => e.groupId === groupId),
}));
