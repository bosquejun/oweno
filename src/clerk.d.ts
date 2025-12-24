import "@clerk/shared/types";

declare global {
  interface CustomJwtSessionClaims {
    // Define the shape of your public metadata here
    metadata?: {
      displayName?: string;
      avatarUrl?: string;
    };
    // You can also define other custom claims if needed
    // 'privateMetadata' and 'unsafeMetadata' are generally handled server-side,
    // but if they are included in the JWT for specific reasons, they can be typed here.
  }
}

// Optional: Extend the User, Organization, etc. resource objects for full type safety
// This allows you to access the typed metadata directly on the user object (e.g., user.publicMetadata.role)
declare module "@clerk/shared/types" {
  interface User extends CustomJwtSessionClaims {}
  // Add other resource types like Organization or OrganizationMembership if you are using their metadata
  // interface Organization extends CustomJwtSessionClaims {}
}
