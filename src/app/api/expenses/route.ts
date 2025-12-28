import { CACHE_TAGS } from "@/constants";
import { createExpense } from "@/services/expenseService";
import { getCachedGroupDetailsById } from "@/services/groupService";
import { getCachedUserById } from "@/services/userService";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const POST = async (req: Request) => {
	const { userId } = await auth();
	if (!userId) {
		return new Response("Unauthorized", { status: 401 });
	}

	const user = await getCachedUserById(userId);
	if (!user) {
		return new Response("User not found", { status: 401 });
	}

	const body = await req.json();
	const { groupId, title, amount, paidById, date, splitType, splits, category, splitMetadata } =
		body;

	const group = await getCachedGroupDetailsById(groupId);
	if (!group) {
		return new Response("Group not found", { status: 404 });
	}

	if (!group.members.some((member) => member.id === user.id)) {
		return new Response("User is not a member of the group", { status: 403 });
	}

	if (!group.members.some((member) => member.id === paidById)) {
		return new Response("Paid by user is not a member of the group", { status: 400 });
	}

	const expense = await createExpense({
		group,
		paidBy: {
			id: paidById,
		},
		splits,
		title,
		amount,
		category,
		date,
		splitType,
		splitMetadata,
	});
	revalidateTag(CACHE_TAGS.EXPENSE(expense.id), {});
	await revalidateTag(CACHE_TAGS.GROUP_EXPENSES(groupId), {});
	for (const member of group.members) {
		await revalidateTag(CACHE_TAGS.USER_EXPENSES(member.id), {});
	}

	revalidatePath(`/groups/${groupId}`);
	// Dashboard cache tags are revalidated above, so affected users will get fresh data
	// Client-side router.refresh() will handle immediate updates for the current user
	return new Response(JSON.stringify(expense), { status: 200 });
};
