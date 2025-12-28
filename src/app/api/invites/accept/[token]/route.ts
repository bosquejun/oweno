import { CACHE_TAGS } from "@/constants";
import { addFriend } from "@/services/friendService";
import { acceptInvite, getInviteByToken } from "@/services/inviteService";
import { getUserById, upsertUser } from "@/services/userService";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ token: string }> }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { token } = await params;
		const invite = await getInviteByToken(token);

		if (!invite) {
			return NextResponse.json({ error: "Invite not found" }, { status: 404 });
		}

		if (invite.status !== "PENDING") {
			return NextResponse.json(
				{ error: `Invite is ${invite.status.toLowerCase()}` },
				{ status: 400 }
			);
		}

		// Get or create user
		let user = await getUserById(userId);
		const clerkClientInstance = await clerkClient();
		const clerkUser = await clerkClientInstance.users.getUser(userId);

		if (!user) {
			// Create user if they don't exist
			await upsertUser(userId, {
				displayName: clerkUser.fullName || clerkUser.emailAddresses[0].emailAddress,
				email: clerkUser.emailAddresses[0].emailAddress,
				avatar: clerkUser.imageUrl || undefined,
				preferredCurrency: "PHP",
				preferredLocale: "en-PH",
			});
			user = await getUserById(userId);
		}

		if (!user) {
			return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
		}

		// Verify email matches invite
		if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
			return NextResponse.json({ error: "Email does not match invite" }, { status: 400 });
		}

		// Accept invite
		await acceptInvite(token, user.id);

		await clerkClientInstance.users.updateUser(userId, {
			publicMetadata: {
				...clerkUser.publicMetadata,
				inviteToken: null,
			},
		});

		await addFriend(invite.inviterId, user.id);

		revalidateTag(CACHE_TAGS.USER_INVITES(invite.inviterId), {});
		revalidateTag(CACHE_TAGS.USER_FRIENDS(invite.inviterId), {});
		revalidateTag(CACHE_TAGS.USER_INVITES(user.id), {});
		revalidateTag(CACHE_TAGS.USER_FRIENDS(user.id), {});

		return NextResponse.json({
			success: true,
			groupId: invite.groupId,
			message: invite.groupId
				? `You've been added to ${invite.group?.name || "the group"}!`
				: "Invite accepted successfully!",
		});
	} catch (error) {
		console.error("Error accepting invite:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
