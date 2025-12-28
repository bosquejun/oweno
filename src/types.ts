import { z } from "zod";
import {
	BalanceSchema,
	DebtSchema,
	ExpenseSchema,
	GroupSchema,
	SplitSchema,
	SplitTypeEnum,
	UserSchema,
} from "./schemas";

export type UserType = z.infer<typeof UserSchema>;
export type GroupType = z.infer<typeof GroupSchema>;
export type SplitType = z.infer<typeof SplitTypeEnum>;
export const SplitType = {
	EQUAL: "EQUAL" as const,
	EXACT: "EXACT" as const,
	PERCENT: "PERCENT" as const,
	SHARES: "SHARES" as const,
};
export type Split = z.infer<typeof SplitSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Debt = z.infer<typeof DebtSchema>;
export type Balance = z.infer<typeof BalanceSchema>;

export type PaginationParams = {
	page: number;
	limit: number;
};

export type PaginationResponse<T> = {
	data: T[];
	total: number;
	page: number;
	limit: number;
};
