import { CACHE_TAGS } from "@/constants";
import { getCachedInviteByToken } from "@/services/inviteService";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ token: string }> }
) {
	try {
		const { token } = await params;
		const invite = await getCachedInviteByToken(token);

		if (!invite) {
			return NextResponse.json(
				{ error: "Invite not found" },
				{ status: 404 }
			);
		}

		revalidateTag(CACHE_TAGS.INVITE(token), {});

		// Don't expose sensitive data
		return NextResponse.json({
			id: invite.id,
			email: invite.email,
			status: invite.status,
			expiresAt: invite.expiresAt,
			inviter: invite.inviter,
			group: invite.group,
		});
	} catch (error) {
		console.error("Error fetching invite:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

