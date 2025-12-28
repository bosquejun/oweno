import { CACHE_TAGS } from "@/constants";
import prisma from "@/lib/prisma";
import { createInvite, getInvitesByInviter } from "@/services/inviteService";
import { getCachedUserById, getUserById } from "@/services/userService";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getCachedUserById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const body = await request.json();
		const { email, groupId, expiresInDays } = body;

		if (!email || !email.includes("@")) {
			return NextResponse.json(
				{ error: "Valid email is required" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const clerkClientInstance = await clerkClient();

		// Create invite in database FIRST to get the token
		const invite = await createInvite({
			email,
			inviterId: user.id,
			groupId,
			expiresInDays: expiresInDays || 7,
		});

		let clerkInvitationId: string | undefined;
		try {
			
			const clerkInvitation = await clerkClientInstance.invitations.createInvitation({
				emailAddress: email,
				expiresInDays: expiresInDays || 7,
				ignoreExisting: true,
				publicMetadata: {
					invitedBy: user.id,
					groupId: groupId || null,
					inviteToken: invite.token, // Store token in metadata as backup
				}
			});
			clerkInvitationId = clerkInvitation.id;

			// Update invite with Clerk invitation ID
			await prisma.invite.update({
				where: { id: invite.id },
				data: { clerkInvitationId },
			});

            revalidateTag(CACHE_TAGS.USER_INVITES(user.id), {});
		} catch (error) {
			console.error("Error creating Clerk invitation:", error);
			// Continue without Clerk invitation if it fails
		}

		return NextResponse.json(invite, { status: 201 });
	} catch (error) {
		console.error("Error creating invite:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
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

		const invites = await getInvitesByInviter(user.id);

		return NextResponse.json(invites);
	} catch (error) {
		console.error("Error fetching invites:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

