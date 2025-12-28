import { CACHE_TAGS } from "@/constants";
import { cancelInvite, resendInvite } from "@/services/inviteService";
import { getUserById } from "@/services/userService";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const { id } = await params;
		const inviteData = await cancelInvite(id, user.id);

		const clerkClientInstance = await clerkClient();    
		const clerkUser = await clerkClientInstance.users.getUser(userId);
		await clerkClientInstance.users.updateUser(userId, {
			publicMetadata: {
				...clerkUser.publicMetadata,
                inviteToken: null,
            },
		});

		if(inviteData.clerkInvitationId){
			await clerkClientInstance.invitations.revokeInvitation(inviteData.clerkInvitationId);
		}

		revalidateTag(CACHE_TAGS.USER_INVITES(user.id), {});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error cancelling invite:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const { id } = await params;
		const body = await request.json();
		const { clerkInvitationId } = body;

		// Resend invite
		const updatedInvite = await resendInvite(id, user.id, clerkInvitationId);

		// Optionally resend Clerk invitation
		if (updatedInvite.email && !updatedInvite.clerkInvitationId) {
			try {
				const clerkClientInstance = await clerkClient();
				const clerkInvitation = await clerkClientInstance.invitations.createInvitation({
					emailAddress: updatedInvite.email,
					publicMetadata: {
						invitedBy: user.id,
						groupId: updatedInvite.groupId || null,
					},
				} as any);
				
				// Update with new Clerk invitation ID
				await resendInvite(id, user.id, clerkInvitation.id);
			} catch (error) {
				console.error("Error resending Clerk invitation:", error);
			}
		}

		revalidateTag(CACHE_TAGS.USER_INVITES(user.id), {});

		return NextResponse.json({ success: true, invite: updatedInvite });
	} catch (error) {
		console.error("Error resending invite:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}

