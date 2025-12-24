import { Group, Expense, User } from '../types';

const STORAGE_KEY = 'oweno_data';

const getStoredData = () => {
  try {
    const data = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!data) return { groups: [], expenses: [], friends: [] };
    const parsed = JSON.parse(data);
    return {
      groups: (parsed.groups || []).map((g: any) => ({ 
        ...g, 
        createdAt: new Date(g.createdAt),
        startDate: g.startDate ? new Date(g.startDate) : undefined,
        endDate: g.endDate ? new Date(g.endDate) : undefined
      })),
      expenses: (parsed.expenses || []).map((e: any) => ({ ...e, date: new Date(e.date) })),
      friends: (parsed.friends || [])
    };
  } catch (e) {
    console.warn("Storage access failed:", e);
    return { groups: [], expenses: [], friends: [] };
  }
};

const saveData = (groups: Group[], expenses: Expense[], friends: User[]) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ groups, expenses, friends }));
    }
  } catch (e) {
    console.error("Failed to save data:", e);
  }
};

const initSeed = () => {
  try {
    const existing = getStoredData();
    // Only seed if we have no groups at all
    if (existing.groups.length === 0) {
      const seedGroups: Group[] = [
        {
          id: 'g1',
          name: 'BGC Staycation',
          description: 'Weekend getaway with the barkada.',
          createdAt: new Date(),
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000 * 2), // 2 days later
          members: [
            { id: 'u1', name: 'Kai', email: 'kai@oweno.ph', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai' },
            { id: 'u2', name: 'Miguel', email: 'miggy@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel' },
            { id: 'u3', name: 'Sammie', email: 'sammie@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sammie' }
          ]
        }
      ];
      saveData(seedGroups, [], []);
    }
  } catch (e) {
    console.error("Seed failed:", e);
  }
};

// Initialize seed on module load
initSeed();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApi = {
  getGroups: async (): Promise<Group[]> => {
    await delay(600);
    return getStoredData().groups;
  },
  getGroup: async (id: string): Promise<Group | undefined> => {
    await delay(400);
    const data = getStoredData();
    return data.groups.find(g => g.id === id);
  },
  getExpenses: async (groupId: string): Promise<Expense[]> => {
    await delay(500);
    return getStoredData().expenses.filter(e => e.groupId === groupId);
  },
  getAllExpenses: async (): Promise<Expense[]> => {
    await delay(500);
    return getStoredData().expenses;
  },
  createGroup: async (group: Group): Promise<Group> => {
    await delay(800);
    const { groups, expenses, friends } = getStoredData();
    saveData([group, ...groups], expenses, friends);
    return group;
  },
  updateGroup: async (group: Group): Promise<Group> => {
    await delay(700);
    const { groups, expenses, friends } = getStoredData();
    const updatedGroups = groups.map(g => g.id === group.id ? group : g);
    saveData(updatedGroups, expenses, friends);
    return group;
  },
  addExpense: async (expense: Expense): Promise<Expense> => {
    await delay(700);
    const { groups, expenses, friends } = getStoredData();
    saveData(groups, [expense, ...expenses], friends);
    return expense;
  },
  updateExpense: async (expense: Expense): Promise<Expense> => {
    await delay(700);
    const { groups, expenses, friends } = getStoredData();
    const updatedExpenses = expenses.map(e => e.id === expense.id ? expense : e);
    saveData(groups, updatedExpenses, friends);
    return expense;
  },
  deleteExpense: async (id: string): Promise<void> => {
    await delay(500);
    const { groups, expenses, friends } = getStoredData();
    saveData(groups, expenses.filter(e => e.id !== id), friends);
  },
  getFriends: async (): Promise<User[]> => {
    await delay(500);
    return getStoredData().friends;
  },
  addFriend: async (friend: User): Promise<User> => {
    await delay(600);
    const { groups, expenses, friends } = getStoredData();
    if (friends.find(f => f.id === friend.id)) return friend;
    saveData(groups, expenses, [friend, ...friends]);
    return friend;
  },
  removeFriend: async (id: string): Promise<void> => {
    await delay(500);
    const { groups, expenses, friends } = getStoredData();
    saveData(groups, expenses, friends.filter(f => f.id !== id));
  }
};