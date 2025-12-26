import { CACHE_TAGS, GROUPS_TTL } from "@/constants";
import { GroupCreateInput } from "@/generated/prisma/models";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/dist/server/web/spec-extension/unstable-cache";



export const getGroupsByUserId = async (userId: string) => {
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { id: userId },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include:{
      members: true,
    }
  });
  return groups;
};


export const getCachedGroupsByUserId = async (userId: string) => {
  return unstable_cache(() => getGroupsByUserId(userId), [CACHE_TAGS.GROUP(userId)], { revalidate: GROUPS_TTL })();
}


export const createGroup = async (group: GroupCreateInput) => {
  const newGroup = await prisma.group.create({
    data: group,
  });

  revalidateTag(CACHE_TAGS.GROUP(newGroup.id), {});
  revalidatePath('/groups');
  return newGroup;
};