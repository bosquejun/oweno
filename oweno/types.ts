
import { z } from 'zod';
import { 
  UserSchema, 
  GroupSchema, 
  SplitTypeEnum, 
  SplitSchema, 
  ExpenseSchema, 
  DebtSchema, 
  BalanceSchema 
} from './schemas';

export type User = z.infer<typeof UserSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type SplitType = z.infer<typeof SplitTypeEnum>;
export const SplitType = {
  EQUAL: 'EQUAL' as const,
  EXACT: 'EXACT' as const,
  PERCENT: 'PERCENT' as const,
  SHARES: 'SHARES' as const,
};
export type Split = z.infer<typeof SplitSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Debt = z.infer<typeof DebtSchema>;
export type Balance = z.infer<typeof BalanceSchema>;
