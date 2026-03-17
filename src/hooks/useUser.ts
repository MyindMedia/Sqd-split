import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// Session-aware hook that uses phone number from localStorage
export function useUser() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // Read phone from localStorage (saved in Login.tsx)
  const phone = typeof window !== 'undefined' ? localStorage.getItem('userPhone') : null;
  
  // Try to find user by phone or fallback to "Maddy" for dev
  const foundUser = useQuery(api.users.getUser, phone ? { phone } : { name: "Maddy" } as any);
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    async function ensureUser() {
      if (foundUser) {
        setUserId(foundUser._id);
      } else if (foundUser === null && phone) {
        // Create new user if they logged in with a new phone
        const id = await createUser({
          name: "Lawrence B.",
          handle: "@thamyind",
          phone: phone,
        });
        setUserId(id);
      }
    }
    ensureUser();
  }, [foundUser, createUser, phone]);

  const user = useQuery(api.users.getUser, userId ? { userId } as any : "skip");

  return {
    user,
    userId,
    isLoading: user === undefined,
    logout: () => {
      localStorage.removeItem('userPhone');
      window.location.href = '/login';
    }
  };
}
