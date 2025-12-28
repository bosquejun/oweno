import { DetailedExpense } from "@/app/(protected)/groups/[id]/page.client";
import { User } from "@/generated/prisma/client";
import { Balance, Debt } from "../types";

/**
 * Calculates net balances for all members in a group based on expenses.
 */
export const calculateBalances = (members: User[], expenses: DetailedExpense[]): Balance[] => {
	const balances: Record<string, number> = {};
	const userIdsInExpenses = new Set<string>();

	// Initialize balances for all members
	members.forEach((m) => {
		balances[m.id] = 0;
		userIdsInExpenses.add(m.id);
	});

	expenses.forEach((expense) => {
		// Track all user IDs involved in expenses
		userIdsInExpenses.add(expense.paidById);
		expense.splits.forEach((split) => {
			userIdsInExpenses.add(split.userId);
		});

		// Paid by person gets credit
		if (!balances[expense.paidById]) {
			balances[expense.paidById] = 0;
		}
		balances[expense.paidById] += expense.amount;

		// Each person in the split owes their part
		expense.splits.forEach((split) => {
			if (!balances[split.userId]) {
				balances[split.userId] = 0;
			}
			balances[split.userId] -= split.amount;
		});
	});

	// Return balances for all members (including those not in original members array)
	return Array.from(userIdsInExpenses).map((userId) => ({
		userId,
		net: balances[userId] || 0,
	}));
};

/**
 * Simplifies debts to determine who owes whom.
 * Uses a greedy algorithm to match largest debtors with largest creditors.
 */
export const simplifyDebts = (balances: Balance[]): Debt[] => {
	const creditors = balances.filter((b) => b.net > 0.01).sort((a, b) => b.net - a.net);
	const debtors = balances
		.filter((b) => b.net < -0.01)
		.map((d) => ({ ...d, net: Math.abs(d.net) }))
		.sort((a, b) => b.net - a.net);

	const debts: Debt[] = [];

	let i = 0,
		j = 0;
	while (i < debtors.length && j < creditors.length) {
		const amount = Math.min(debtors[i].net, creditors[j].net);

		debts.push({
			from: debtors[i].userId,
			to: creditors[j].userId,
			amount: Number(amount.toFixed(2)),
		});

		debtors[i].net -= amount;
		creditors[j].net -= amount;

		if (debtors[i].net < 0.01) i++;
		if (creditors[j].net < 0.01) j++;
	}

	return debts;
};
