import { GroupCreateInput } from "@/generated/prisma/models";
import { createGroup } from "@/services/groupService";
import { auth } from "@clerk/nextjs/server";



export const POST = async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const body = await req.json();

  const group = await createGroup(body as GroupCreateInput);
  return new Response(JSON.stringify(group), { status: 200 });
}