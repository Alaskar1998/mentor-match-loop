import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  country?: string;
  age?: number;
  gender?: string;
  phone?: string;
  skillsToTeach: Array<{
    name: string;
    level: string;
    description: string;
    category?: string;
  }>;
  skillsToLearn: string[];
  willingToTeachWithoutReturn: boolean;
  userType: "free" | "premium";
  remainingInvites: number;
  appCoins: number;
  phoneVerified: boolean;
  successfulExchanges: number;
  rating: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (userData: any) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithFacebook: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            // Fetch user profile from database
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              .then(({ data: profile }) => {
                if (profile) {
                  const userData: User = {
                    id: profile.id,
                    email: profile.email || session.user.email || '',
                    name: profile.display_name || '',
                    profilePicture: profile.avatar_url,
                    bio: profile.bio,
                    country: profile.country,
                    age: profile.age,
                    gender: profile.gender,
                    phone: profile.phone,
                    skillsToTeach: Array.isArray(profile.skills_to_teach) ? profile.skills_to_teach as Array<{name: string; level: string; description: string; category?: string}> : [],
                    skillsToLearn: profile.skills_to_learn || [],
                    willingToTeachWithoutReturn: profile.willing_to_teach_without_return || false,
                    userType: "free", // TODO: Check subscription status from database
                    remainingInvites: 3,
                    appCoins: 50,
                    phoneVerified: false,
                    successfulExchanges: 0,
                    rating: 5.0
                  };
                  setUser(userData);
                  setIsAuthenticated(true);
                }
              });
          }, 0);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        // The auth state change listener will handle the rest
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signup = async (userData: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.name
          }
        }
      });
      
      if (error) {
        return { error: error.message };
      }

      // Note: Profile will be created by the trigger
      // We can update it with additional info if needed
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user && session) {
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update database profile
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: updatedUser.name,
          bio: updatedUser.bio,
          country: updatedUser.country,
          age: updatedUser.age,
          gender: updatedUser.gender,
          phone: updatedUser.phone,
          avatar_url: updatedUser.profilePicture,
          skills_to_teach: updatedUser.skillsToTeach,
          skills_to_learn: updatedUser.skillsToLearn,
          willing_to_teach_without_return: updatedUser.willingToTeachWithoutReturn
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      login,
      signup,
      signInWithGoogle,
      signInWithFacebook,
      signInWithApple,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};