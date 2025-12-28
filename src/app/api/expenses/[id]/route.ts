import { CACHE_TAGS } from "@/constants";
import { Split } from "@/generated/prisma/client";
import { getCachedExpenseById, updateExpense } from "@/services/expenseService";
import { getCachedUserById } from "@/services/userService";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";



export const PUT = async (req: Request, {params}:{params: Promise<{ id: string }>}) => {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const user = await getCachedUserById(userId);
  if (!user) {
    return new Response('User not found', { status: 401 });
  }

  const expense = await getCachedExpenseById(id);

  if(!expense){
    return new Response('Expense not found', { status: 404 });
  }

  if(!expense.group.members.some(member => member.id === user.id)){
    return new Response('You are not authorized to update this expense', { status: 403 });
  }


  const body = await req.json();

  if (!expense.group.members.some(member => member.id === body.paidById)) {
    return new Response('Paid by user is not a member of the group', { status: 400 });
  }
  const updatedExpense = await updateExpense(id, {
    title: body.title,
    amount: body.amount,
    date: body.date,
    splitType: body.splitType,
    category: body.category,
    splitMetadata: body.splitMetadata,
    splits: body.splits.map((split: Pick<Split, 'amount' | 'userId'>) => ({
        amount: split.amount,
        userId: split.userId,
    })),
    group: expense.group,
    paidBy: {
        id: body.paidById || expense.paidBy.id,
    },
  });

  revalidateTag(CACHE_TAGS.EXPENSE(id), {});
  await revalidateTag(CACHE_TAGS.GROUP_EXPENSES(expense.group.id), {});
  for (const member of expense.group.members) {
    await revalidateTag(CACHE_TAGS.USER_EXPENSES(member.id), {});
  }
  revalidatePath(`/groups/${expense.group.id}`);
  revalidatePath(`/groups/${expense.group.id}/history`);
  // Dashboard cache tags are revalidated above, so affected users will get fresh data
  // Client-side router.refresh() will handle immediate updates for the current user
return new Response(JSON.stringify(updatedExpense), { status: 200 });
}