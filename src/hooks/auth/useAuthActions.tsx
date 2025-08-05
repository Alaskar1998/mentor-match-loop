/**
 * @file useAuthActions.tsx
 * @description Hook for authentication actions
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * @interface AuthActions
 * @description Authentication actions interface
 */
interface AuthActions {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (userData: any) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithFacebook: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: any) => Promise<void>;
}

/**
 * @hook useAuthActions
 * @description Provides authentication action functions
 *
 * @returns {AuthActions} Object containing authentication action functions
 *
 * @example
 * const { login, signup, logout } = useAuthActions();
 */
export const useAuthActions = (): AuthActions => {
  /**
   * @function login
   * @description Authenticates user with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Login error:', error);
        return { error: error.message };
      }

      return { error: undefined };
    } catch (error) {
      logger.error('Login error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  /**
   * @function signup
   * @description Creates a new user account
   */
  const signup = useCallback(async (userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        logger.error('Signup error:', error);
        return { error: error.message };
      }

      return { error: undefined };
    } catch (error) {
      logger.error('Signup error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  /**
   * @function signInWithGoogle
   * @description Authenticates user with Google
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logger.error('Google sign in error:', error);
        return { error: error.message };
      }

      return { error: undefined };
    } catch (error) {
      logger.error('Google sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  /**
   * @function signInWithFacebook
   * @description Authenticates user with Facebook
   */
  const signInWithFacebook = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logger.error('Facebook sign in error:', error);
        return { error: error.message };
      }

      return { error: undefined };
    } catch (error) {
      logger.error('Facebook sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  /**
   * @function signInWithApple
   * @description Authenticates user with Apple
   */
  const signInWithApple = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logger.error('Apple sign in error:', error);
        return { error: error.message };
      }

      return { error: undefined };
    } catch (error) {
      logger.error('Apple sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  /**
   * @function logout
   * @description Signs out the current user
   */
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      logger.error('Logout error:', error);
    }
  }, []);

  /**
   * @function updateUser
   * @description Updates user profile information
   */
  const updateUser = useCallback(async (updates: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        logger.error('Update user error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }, []);

  return {
    login,
    signup,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    logout,
    updateUser,
  };
};
