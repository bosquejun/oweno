
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  avatar: z.string().url().optional(),
});

export const SplitTypeEnum = z.enum(['EQUAL', 'EXACT', 'PERCENT', 'SHARES']);

export const SplitSchema = z.object({
  userId: z.string(),
  amount: z.number().min(0, "Split amount cannot be negative"),
});

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Group name must be at least 3 characters long"),
  description: z.string().optional(),
  members: z.array(UserSchema).min(1, "Group must have at least one member"),
  createdAt: z.date(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

export const ExpenseSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  title: z.string().min(3, "Bill title must be at least 3 characters long"),
  amount: z.number().positive("Amount must be greater than zero"),
  paidById: z.string(),
  date: z.date(),
  splitType: SplitTypeEnum,
  splits: z.array(SplitSchema),
  category: z.string(),
  // splitMetadata stores the original inputs (like share counts or percentages) 
  // so editing is consistent even after rounding.
  splitMetadata: z.record(z.string(), z.string()).optional(),
});

export const DebtSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number(),
});

export const BalanceSchema = z.object({
  userId: z.string(),
  net: z.number(),
});

