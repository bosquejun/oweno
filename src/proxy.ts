import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/privacy", "/terms"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);
const isInviteRoute = createRouteMatcher(["/invite(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { isAuthenticated, redirectToSignIn, sessionClaims } = await auth();
	const dashboardUrl = new URL(`/dashboard`, req.url);

	const isPublic = isPublicRoute(req);
	const isApi = isApiRoute(req);
	const isOnboarding = isOnboardingRoute(req);
	const isInvite = isInviteRoute(req);


	// Allow API routes to proceed without onboarding checks
	if (isApi) {
		return NextResponse.next();
	}

	// For users visiting /onboarding, don't try to redirect
	if (isAuthenticated && isOnboarding) {
		return NextResponse.next();
	}

	// If not authenticated and route is not public, redirect to sign-in
	if (!isAuthenticated && !isPublic) {
		return redirectToSignIn();
	}

	// Catch users who do not have `onboardingComplete: true` in their publicMetadata
	// Redirect them to the /onboarding route to complete onboarding
	// But skip this check for API routes (already handled above)
	if (
		isAuthenticated &&
		!sessionClaims?.metadata?.onboardingComplete &&
		!isApi
	) {
		const onboardingUrl = new URL("/onboarding", req.url);
		return NextResponse.redirect(onboardingUrl);
	}

	// Handle invite token logic for authenticated users who completed onboarding
	if (isAuthenticated && sessionClaims?.metadata?.onboardingComplete) {
		const {inviteToken} = sessionClaims?.metadata;

		// Case 1: User has inviteToken in metadata and is NOT on invite page -> redirect to invite page
		if (inviteToken && !isInvite) {
			const inviteUrl = new URL(`/invite/${inviteToken}`, req.url);
			return NextResponse.redirect(inviteUrl);
		} 

		// Case 2: User has NO inviteToken in metadata but is on an invite page -> redirect to dashboard
		if (!inviteToken && isInvite) {
			return NextResponse.redirect(dashboardUrl);
		}

		// Case 3: User has inviteToken and is on invite page -> allow access
		// Case 4: User has NO inviteToken and is NOT on invite page -> allow access
		// (Both cases fall through to NextResponse.next())
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
