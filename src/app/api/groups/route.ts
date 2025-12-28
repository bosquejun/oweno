import { CACHE_TAGS } from "@/constants";
import { createGroup } from "@/services/groupService";
import { getCachedUserById } from "@/services/userService";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";



export const POST = async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await getCachedUserById(userId);
  if(!user){
    return new Response('User not found', { status: 401 });
  }

  const body = await req.json();



  const group = await createGroup(body);


  for (const member of group.members) {
    revalidateTag(CACHE_TAGS.USER_GROUPS(member.id), {});
  }
  revalidateTag(CACHE_TAGS.GROUP(group.id), {});
  return new Response(JSON.stringify(group), { status: 200 });
}