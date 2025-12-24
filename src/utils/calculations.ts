
import { Expense, Debt, Balance, User } from '../types';

/**
 * Calculates net balances for all members in a group based on expenses.
 */
export const calculateBalances = (members: User[], expenses: Expense[]): Balance[] => {
  const balances: Record<string, number> = {};
  
  members.forEach(m => (balances[m.id] = 0));

  expenses.forEach((expense) => {
    // Paid by person gets credit
    balances[expense.paidById] += expense.amount;
    
    // Each person in the split owes their part
    expense.splits.forEach((split) => {
      balances[split.userId] -= split.amount;
    });
  });

  return members.map(m => ({
    userId: m.id,
    net: balances[m.id]
  }));
};

/**
 * Simplifies debts to determine who owes whom.
 * Uses a greedy algorithm to match largest debtors with largest creditors.
 */
export const simplifyDebts = (balances: Balance[]): Debt[] => {
  const creditors = balances
    .filter(b => b.net > 0.01)
    .sort((a, b) => b.net - a.net);
  const debtors = balances
    .filter(b => b.net < -0.01)
    .map(d => ({ ...d, net: Math.abs(d.net) }))
    .sort((a, b) => b.net - a.net);

  const debts: Debt[] = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].net, creditors[j].net);
    
    debts.push({
      from: debtors[i].userId,
      to: creditors[j].userId,
      amount: Number(amount.toFixed(2))
    });

    debtors[i].net -= amount;
    creditors[j].net -= amount;

    if (debtors[i].net < 0.01) i++;
    if (creditors[j].net < 0.01) j++;
  }

  return debts;
};

