import { getCachedFriendsListByUserId } from "@/services/friendService";
import { getInvitesByInviter } from "@/services/inviteService";
import { getCachedUserById } from "@/services/userService";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";


const Loading = () => (
	<div className='flex flex-col items-center justify-center min-h-[60vh] gap-3'>
		<Loader2 className='w-8 h-8 text-emerald-600 animate-spin' />
		<p className='text-slate-400 font-bold uppercase tracking-widest text-[10px]'>
			Loading your barkada...
		</p>
	</div>
);


const ClientPage = dynamic(() => import("./page.client"), {
  loading: () => <Loading />,
});


export default async function Page() {
  const { userId } = await auth();
  const clerkClientInstance = await clerkClient();

  if (!userId) {
    return <Loading />;
  }

  const user = await getCachedUserById(userId);

  if (!user) {
    return <Loading />;
  }

  const friends = await getCachedFriendsListByUserId(user?.id, { page: 1, limit: 10 });

  const databaseInvites = await getInvitesByInviter(user.id);

  // Fetch Clerk invitations to get URLs
  const clerkInvitations = await clerkClientInstance.invitations.getInvitationList();
  
  // Map database invites with Clerk invitation URLs
  const invitesWithUrls = databaseInvites.map((invite) => {
    const clerkInvitation = clerkInvitations.data.find(
      (ci) => ci.id === invite.clerkInvitationId
    );
    
    return {
      ...invite,
      clerkUrl: clerkInvitation?.url || null,
      clerkStatus: clerkInvitation?.status || null,
      clerkRevoked: clerkInvitation?.revoked || false,
    };
  });

  return <ClientPage {...friends} invitedFriends={invitesWithUrls} />
}