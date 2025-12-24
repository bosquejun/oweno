import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


const isPublicRoute = createRouteMatcher(['/', '/privacy', '/terms']);

export default clerkMiddleware(async (auth, req) => {
    const { isAuthenticated, redirectToSignIn } = await auth();

    const isPublic = isPublicRoute(req);


    // If authenticated and route is not public, also redirect to sign-in (as per prompt)
    if (!isAuthenticated && !isPublic) {
        return redirectToSignIn();
    }

    // In all other cases, proceed
    return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};