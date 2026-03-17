import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser as useClerkUser } from "@clerk/react";
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// Session-aware hook that syncs Clerk identity with Convex
export function useUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // Sync Clerk user to Convex
  const createUser = useMutation(api.users.createUser);
  const foundUser = useQuery(api.users.getUser, clerkUser ? { email: clerkUser.primaryEmailAddress?.emailAddress } : "skip");

  useEffect(() => {
    async function syncUser() {
      if (clerkLoaded && clerkUser) {
        if (foundUser) {
          setUserId(foundUser._id);
        } else if (foundUser === null) {
          const id = await createUser({
            name: clerkUser.fullName || "New User",
            handle: `@${clerkUser.username || clerkUser.firstName?.toLowerCase() || 'user'}`,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            avatarUrl: clerkUser.imageUrl,
          });
          setUserId(id);
        }
      }
    }
    syncUser();
  }, [clerkUser, foundUser, createUser, clerkLoaded]);

  const user = useQuery(api.users.getUser, userId ? { userId } as any : "skip");

  return {
    user,
    userId,
    isLoading: !clerkLoaded || (userId === null && clerkUser !== null),
    clerkUser,
  };
}
