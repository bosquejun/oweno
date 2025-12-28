import { CACHE_TAGS, GROUPS_TTL } from "@/constants";
import { GroupCreateInput, GroupUpdateInput } from "@/generated/prisma/models";
import prisma from "@/lib/prisma";
import { User } from "@clerk/nextjs/server";
import { unstable_cache } from "next/dist/server/web/spec-extension/unstable-cache";

export const getGroupsByUserId = async (userId: string) => {
	const groups = await prisma.group.findMany({
		where: {
			members: {
				some: { id: userId },
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		include: {
			members: true,
		},
	});
	return groups;
};

export const getCachedGroupsByUserId = async (userId: string) => {
	return unstable_cache(() => getGroupsByUserId(userId), ["group", `user:group:${userId}`], {
		revalidate: GROUPS_TTL,
		tags: [CACHE_TAGS.USER_GROUPS(userId)],
	})();
};

export const getGroupDetailsById = async (groupId: string) => {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		include: {
			members: true,
		},
	});

	return group;
};

export const getCachedGroupDetailsById = async (groupId: string) => {
	return unstable_cache(() => getGroupDetailsById(groupId), ["group", `group:${groupId}`], {
		revalidate: GROUPS_TTL,
		tags: [CACHE_TAGS.GROUP(groupId)],
	})();
};

export const createGroup = async (
	group: Omit<GroupCreateInput, "member"> & { members: Pick<User, "id">[] }
) => {
	const newGroup = await prisma.group.create({
		data: {
			...group,
			members: {
				connect: group.members,
			},
		},
		include: {
			members: true,
		},
	});
	return newGroup;
};

export const updateGroup = async (
	groupId: string,
	group: Omit<GroupUpdateInput, "member"> & { members: Pick<User, "id">[] }
) => {
	const updatedGroup = await prisma.group.update({
		where: { id: groupId },
		data: {
			description: group.description,
			startDate: group.startDate,
			endDate: group.endDate,
			members: {
				set: group.members,
			},
			name: group.name,
		},
		include: {
			members: true,
		},
	});

	return updatedGroup;
};
