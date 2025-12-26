import "@clerk/shared/types";

declare global {
	interface CustomJwtSessionClaims {
		// Define the shape of your public metadata here
		metadata?: {
			onboardingComplete?: boolean;
			displayName?: string;
			inviteToken?: string;
			invitedBy?: string;
			groupId?: string | null;
		};
		// You can also define other custom claims if needed
		// 'privateMetadata' and 'unsafeMetadata' are generally handled server-side,
		// but if they are included in the JWT for specific reasons, they can be typed here.
	}
}
