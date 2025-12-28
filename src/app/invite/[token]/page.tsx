import { getInviteByToken } from "@/services/inviteService";
import { auth } from "@clerk/nextjs/server";
import InviteAcceptPage from "./page.client";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	const invite = await getInviteByToken(token);

	if (!invite || ["EXPIRED", "CANCELLED"].includes(invite.status as any)) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
				<div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-100 shadow-xl">
					<h1 className="text-2xl font-black text-slate-900 mb-4">Invite Not Found</h1>
					<p className="text-slate-600 mb-6">
						This invitation link is invalid or has expired/cancelled.
					</p>
					<a
						href="/"
						className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all"
					>
						Go Home
					</a>
				</div>
			</div>
		);
	}

	const { userId } = await auth();
	return <InviteAcceptPage invite={invite} token={token} isAuthenticated={!!userId} />;
}
