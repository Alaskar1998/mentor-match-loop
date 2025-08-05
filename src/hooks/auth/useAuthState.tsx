/**
 * @file useAuthState.tsx
 * @description Hook for managing authentication state
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@/types/auth';
import { logger } from '@/utils/logger';

/**
 * @interface AuthState
 * @description Authentication state interface
 */
interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestoring: boolean;
}

/**
 * @hook useAuthState
 * @description Manages authentication state and session
 *
 * @returns {AuthState} Authentication state with user, session, and loading states
 *
 * @example
 * const { user, session, isAuthenticated, isLoading } = useAuthState();
 */
export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionRestoring, setIsSessionRestoring] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    /**
     * @function setupAuthListener
     * @description Sets up the authentication state change listener
     */
    const setupAuthListener = async () => {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;

          logger.debug('Auth state change:', event, session?.user?.id);
          setSession(session);

          if (session?.user) {
            // Fetch user profile
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (isMounted && profile) {
                setUser(profile);
                setIsAuthenticated(true);
              }
            } catch (error) {
              logger.error('Error fetching profile:', error);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }

          setIsLoading(false);
          setIsSessionRestoring(false);
        }
      );

      subscription = data.subscription;
    };

    setupAuthListener();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    isSessionRestoring,
  };
};
