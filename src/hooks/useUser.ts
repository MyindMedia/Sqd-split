import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser as useClerkUser } from "@clerk/react";
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// Session-aware hook that syncs Clerk identity with Convex
export function useUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // Try to find user by email OR phone (whichever Clerk has)
  const userIdentifier = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.primaryPhoneNumber?.phoneNumber;
  const identifierType = clerkUser?.primaryEmailAddress?.emailAddress ? "email" : "phone";
  
  const foundUser = useQuery(api.users.getUser, clerkUser ? { 
    [identifierType]: userIdentifier 
  } : "skip");

  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    async function syncUser() {
      if (clerkLoaded && clerkUser && foundUser !== undefined) {
        if (foundUser) {
          setUserId(foundUser._id);
        } else if (foundUser === null) {
          const id = await createUser({
            name: clerkUser.fullName || "New User",
            handle: `@${clerkUser.username || clerkUser.firstName?.toLowerCase() || 'user'}`,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            phone: clerkUser.primaryPhoneNumber?.phoneNumber,
            avatarUrl: clerkUser.imageUrl,
          });
          setUserId(id);
        }
      }
    }
    syncUser();
  }, [clerkUser, foundUser, createUser, clerkLoaded]);

  // Fetch full user record once we have a userId
  const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

  return {
    user: user || foundUser, // Prefer the one by ID, fallback to the one by identifier
    userId: userId || foundUser?._id,
    isLoading: !clerkLoaded || (clerkUser && foundUser === undefined),
    clerkUser,
  };
}
