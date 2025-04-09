'use client';

import { createClient } from '@/utils/supabase/client';
import type { Session, User } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => { },
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isRedirecting = useRef(false);

  const isAuthorized = useCallback((email: string | undefined) => {
    const authorizedEmails = process.env.NEXT_PUBLIC_AUTHORIZED_EMAILS?.split(',') || [];
    return email && authorizedEmails.includes(email);
  }, []);

  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    setUser(session?.user ?? null);
    setSession(session);
    setIsLoading(false);

    if (session?.user && isAuthorized(session.user.email) && !isRedirecting.current) {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && pathname !== '/admin/dashboard') {
        isRedirecting.current = true;
        await router.push('/admin/dashboard');
        isRedirecting.current = false;
      }
    } else if (event === 'SIGNED_OUT' && pathname !== '/login') {
      await router.push('/login');
    }
  }, [router, isAuthorized, pathname]);

  useEffect(() => {
    const setServerSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      handleAuthChange('INITIAL_SESSION', session);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    setServerSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [handleAuthChange, supabase.auth]);

  const value = {
    user,
    session,
    signOut: async () => {
      await supabase.auth.signOut();
      router.push('/login');
    },
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUser = () => useContext(AuthContext);

export default AuthProvider;
