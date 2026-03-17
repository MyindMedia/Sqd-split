import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser as useClerkUser } from "@clerk/react";
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// Session-aware hook that syncs Clerk identity with Convex
export function useUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // Use clerkId as the definitive stable identifier
  const foundUser = useQuery(api.users.getUser, clerkUser?.id ? { clerkId: clerkUser.id } : "skip");
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    async function syncUser() {
      // Only sync if Clerk is loaded, we have a user, and the check query has finished
      if (clerkLoaded && clerkUser && foundUser !== undefined) {
        if (foundUser) {
          setUserId(foundUser._id);
        } else if (foundUser === null) {
          try {
            await createUser({
              clerkId: clerkUser.id,
              name: clerkUser.fullName || "New User",
              handle: `@${clerkUser.username || clerkUser.firstName?.toLowerCase() || 'user'}`,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              phone: clerkUser.primaryPhoneNumber?.phoneNumber,
              avatarUrl: clerkUser.imageUrl,
            });
            // Re-query will pick up the new user
          } catch (err) {
            console.error("Failed to sync user to Convex:", err);
          }
        }
      }
    }
    syncUser();
  }, [clerkUser, foundUser, createUser, clerkLoaded]);

  // Fetch full user record once we have a userId
  const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

  // Fallback chain for resilience
  const finalUser = user || foundUser;

  return {
    user: finalUser,
    userId: userId || foundUser?._id,
    isLoading: !clerkLoaded || (clerkUser && foundUser === undefined),
    clerkUser,
  };
}
