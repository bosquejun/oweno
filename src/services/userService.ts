import { CACHE_TAGS, USER_TTL } from "@/constants";
import { UserCreateInput } from "@/generated/prisma/models";
import prisma from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";

export const getUserById = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	});
	return user;
};

export const getCachedUserById = (userId: string) =>
	unstable_cache(() => getUserById(userId), ["user", userId], {
		tags: [CACHE_TAGS.USER(userId)],
		revalidate: USER_TTL,
	})();

export const upsertUser = async (userId: string, data: Omit<UserCreateInput, "clerkId">) => {
	const user = await getUserById(userId);

	if (!user) {
		await prisma.user.create({
			data: {
				...data,
				clerkId: userId,
			} satisfies UserCreateInput,
		});
	} else {
		const { email, ...rest } = data;
		await prisma.user.update({
			where: {
				clerkId: userId,
			},
			data: {
				...rest,
			},
		});
	}

	revalidateTag(CACHE_TAGS.USER(userId), {});
};
