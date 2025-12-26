import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/privacy", "/terms"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { isAuthenticated, redirectToSignIn, sessionClaims } = await auth();

	const isPublic = isPublicRoute(req);
	const isApi = isApiRoute(req);
	const isOnboarding = isOnboardingRoute(req);

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
