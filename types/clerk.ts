// filepath: d:\GithubWorkspace\copa-starter-kit\types\clerk.ts
import type { User } from "@clerk/nextjs/server";

// Define the types that are no longer exported by Clerk
export type UserResource = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl: string;
  emailAddresses?: Array<{
    id: string;
    emailAddress: string;
  }>;
  // Add other properties as needed
};

// Auth object types
export type SignedInAuthObject = {
  userId: string;
  sessionId: string;
  getToken: () => Promise<string>;
};

export type SignedOutAuthObject = {
  userId: null;
  sessionId: null;
  getToken: () => Promise<null>;
};

export type AuthData = {
  userId: string | null;
  sessionId: string | null;
  isSignedIn: boolean;
};

export type ClerkUser = User;

export interface UserSessionData {
  user: UserResource | null;
  isSignedIn: boolean;
  sessionId: string | null;
}

export type AuthObject = SignedInAuthObject | SignedOutAuthObject;

export interface SocialProvider {
  provider: "google" | "github" | "facebook" | "twitter";
  id: string;
}

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  email: string | null;
  primaryEmailId: string | null;
  primaryPhoneNumberId: string | null;
  createdAt: number;
  updatedAt: number;
  socialAccounts: SocialProvider[];
}
