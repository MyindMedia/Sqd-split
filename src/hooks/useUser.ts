import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// Simple hook to simulate a logged-in user and sync with Convex
export function useUser() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // Try to find Maddy (our seeded test user)
  const Maddy = useQuery(api.users.getUserByName, { name: "Maddy" });
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    async function ensureUser() {
      if (Maddy) {
        setUserId(Maddy._id);
      } else if (Maddy === null) {
        // Create user if seed hasn't run or was removed
        const id = await createUser({
          name: "Lawrence B.",
          handle: "@thamyind",
          phone: "+15550123",
        });
        setUserId(id);
      }
    }
    ensureUser();
  }, [Maddy, createUser]);

  const user = useQuery(api.users.getUser, userId ? { userId } as any : "skip");

  return {
    user,
    userId,
    isLoading: user === undefined,
  };
}
