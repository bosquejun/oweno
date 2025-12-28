import { CACHE_TAGS } from "@/constants";
import { getCachedGroupDetailsById, updateGroup } from "@/services/groupService";
import { getCachedUserById } from "@/services/userService";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;
	const group = await getCachedGroupDetailsById(id);
	if (!group) {
		return new Response("Group not found", { status: 404 });
	}
	return new Response(JSON.stringify(group), { status: 200 });
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;
	const { userId } = await auth();

	if (!userId) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!id) {
		return new Response("Group ID is required", { status: 404 });
	}

	const groupDetails = await getCachedGroupDetailsById(id);

	if (!groupDetails) {
		return new Response("Group not found", { status: 404 });
	}

	const user = await getCachedUserById(userId);

	if (!user) {
		return new Response("User not found", { status: 401 });
	}

	if (!groupDetails.members.some((member) => member.id === user.id)) {
		return new Response("You are not authorized to update this group", { status: 403 });
	}

	const body = await req.json();
	const group = await updateGroup(id, body);
	revalidateTag(CACHE_TAGS.GROUP(id), {});

	for (const member of group.members) {
		await revalidateTag(CACHE_TAGS.USER_GROUPS(member.id), {});
	}

	await revalidatePath(`/groups/${id}`);

	return new Response(JSON.stringify(group), { status: 200 });
};
