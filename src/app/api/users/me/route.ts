import { getUserById, upsertUser } from "@/services/userService";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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

		const client = await clerkClient();

		const body = await request.json();
		const {
			onboardingComplete,
			displayName,
			preferredCurrency,
			preferredLocale,
			avatar,
		} = body;

		// Get current user to preserve existing metadata
		const user = await client.users.getUser(userId);

		await upsertUser(userId, {
			displayName: displayName ?? user.fullName ?? "",
			email: user.emailAddresses[0].emailAddress,
			avatar:
				avatar ??
				`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=a4f4cf`,
			preferredCurrency: preferredCurrency ?? "PHP",
			preferredLocale: preferredLocale ?? "en-PH",
		});

		if (!user.publicMetadata?.onboardingComplete) {
			// Update user metadata using Clerk's SDK
			await client.users.updateUserMetadata(userId, {
				publicMetadata: {
					...user.publicMetadata,
					onboardingComplete: onboardingComplete ?? false,
				},
			});
		}

		// Revalidate the protected layout and settings page to reflect changes
		revalidatePath("/", "layout");
		revalidatePath("/settings");
		// revalidatePath("/dashboard");
		// revalidatePath("/groups");
		// revalidatePath("/friends");

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating user metadata:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET() {
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

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error getting user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
