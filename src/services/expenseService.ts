import { CACHE_TAGS, TTL } from "@/constants";
import { Group, Split, User } from "@/generated/prisma/client";
import { ExpenseCreateInput, ExpenseUpdateInput } from "@/generated/prisma/models";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const createExpense = async (
	expenseInput: Omit<ExpenseCreateInput, "splits" | "group" | "paidBy"> & {
		splits: Pick<Split, "amount" | "userId">[];
		group: Pick<Group, "id">;
		paidBy: Pick<User, "id">;
	}
) => {
	const newExpense = await prisma.expense.create({
		data: {
			...expenseInput,
			splits: {
				createMany: {
					data: expenseInput.splits.map((split) => ({
						amount: split.amount,
						userId: split.userId,
					})),
				},
			},
			group: {
				connect: {
					id: expenseInput.group.id,
				},
			},
			paidBy: {
				connect: {
					id: expenseInput.paidBy.id,
				},
			},
		},
	});
	return newExpense;
};

export const getExpensesByGroupId = async (groupId: string) => {
	const expenses = await prisma.expense.findMany({
		where: {
			groupId: groupId,
		},
		include: {
			paidBy: true,
			splits: true,
			group: true,
		},
		orderBy: {
			date: "desc",
		},
	});
	return expenses;
};

export const getCachedExpensesByGroupId = async (groupId: string) => {
	return unstable_cache(() => getExpensesByGroupId(groupId), ["expenses", groupId], {
		tags: [CACHE_TAGS.GROUP_EXPENSES(groupId)],
		revalidate: TTL.ONE_DAY,
	})();
};

export const getExpenseById = async (id: string) => {
	const expense = await prisma.expense.findUnique({
		where: {
			id: id,
		},
		include: {
			paidBy: true,
			splits: true,
			group: {
				include: {
					members: true,
				},
			},
		},
	});
	return expense;
};

export const getCachedExpenseById = async (id: string) => {
	return unstable_cache(() => getExpenseById(id), ["expense", id], {
		tags: [CACHE_TAGS.EXPENSE(id)],
		revalidate: TTL.ONE_DAY,
	})();
};

export const updateExpense = async (
	id: string,
	expenseInput: Omit<ExpenseUpdateInput, "id" | "group" | "paidBy" | "splits"> & {
		splits: Pick<Split, "amount" | "userId">[];
		group: Pick<Group, "id">;
		paidBy: Pick<User, "id">;
	}
) => {
	const updatedExpense = await prisma.expense.update({
		where: {
			id: id,
		},
		data: {
			...expenseInput,
			splits: {
				deleteMany: {},
				createMany: {
					data: expenseInput.splits.map((split) => ({
						amount: split.amount,
						userId: split.userId,
					})),
				},
			},
			group: {
				connect: {
					id: expenseInput.group.id,
				},
			},
			paidBy: {
				connect: {
					id: expenseInput.paidBy.id,
				},
			},
		},
		include: {
			paidBy: true,
			splits: true,
			group: {
				include: {
					members: true,
				},
			},
		},
	});
	return updatedExpense;
};

export const getExpensesByUserId = async (userId: string) => {
	const expenses = await prisma.expense.findMany({
		where: {
			OR: [
				{
					splits: {
						some: {
							userId: userId,
						},
					},
				},
				{
					paidById: userId,
				},
			],
		},
		include: {
			paidBy: true,
			splits: true,
			group: {
				include: {
					members: true,
				},
			},
		},
		orderBy: {
			date: "desc",
		},
	});
	return expenses;
};

export const getCachedExpensesByUserId = async (userId: string) => {
	return unstable_cache(() => getExpensesByUserId(userId), ["expenses", userId], {
		tags: [CACHE_TAGS.USER_EXPENSES(userId)],
		revalidate: TTL.ONE_DAY,
	})();
};
