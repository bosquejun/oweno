import { getCachedFriendsListByUserId } from "@/services/friendService";
import { getCachedGroupsByUserId } from "@/services/groupService";
import { getCachedUserById } from "@/services/userService";
import { auth } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";


const Loading = () =>(
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading groups...</p>
  </div>
);

const ClientPage = dynamic(() => import("./page.client"), {
  loading: () => <Loading />,
});

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    return <Loading />;
  }

  const user = await getCachedUserById(userId);

  if (!user) {
    return <Loading />;
  }

  const groups = await getCachedGroupsByUserId(userId);
  const friends = await getCachedFriendsListByUserId(userId, {limit: 100, page:1});

  return <ClientPage groups={groups} user={user} friends={friends.data || []} />

}