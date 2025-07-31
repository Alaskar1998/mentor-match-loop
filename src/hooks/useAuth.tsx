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
  age_range?: string;
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
  isLoading: boolean;
  isSessionRestoring: boolean; // Add this
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (userData: any) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithFacebook: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSessionRestoring, setIsSessionRestoring] = useState(true); // Add this state

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        if (session?.user) {
          // Prevent multiple simultaneous profile fetches
          if (isLoadingProfile) {
            console.log('⏱️ Profile fetch already in progress, skipping...');
            return;
          }
          
          // Use setTimeout to prevent auth deadlock and allow profile updates to complete
          setTimeout(async () => {
            try {
              setIsLoadingProfile(true);
              
              // Check if we already have the user data for this session
              if (user?.id === session.user.id) {
                console.log('✅ User data already loaded for this session');
                setIsLoadingProfile(false);
                return;
              }
              
              // Fetch user profile from database with retry mechanism
              let profile = null;
              let error = null;
              
              // Try up to 3 times with increasing delays
              for (let attempt = 0; attempt < 3; attempt++) {
                const delay = attempt * 500; // 0ms, 500ms, 1000ms
                if (delay > 0) {
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                const result = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                
                if (!result.error) {
                  profile = result.data;
                  break;
                } else {
                  error = result.error;
                  console.log(`Profile fetch attempt ${attempt + 1} failed:`, result.error);
                }
              }

              if (error) {
                console.error('Error fetching user profile after all attempts:', error);
                // Set basic user data even if profile fetch fails
                const userData: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.full_name || '',
                  profilePicture: '',
                  bio: '',
                  country: '',
                  age: undefined,
                  age_range: '',
                  gender: '',
                  phone: '',
                  skillsToTeach: [],
                  skillsToLearn: [],
                  willingToTeachWithoutReturn: false,
                  userType: "free",
                  remainingInvites: 3,
                  appCoins: 50,
                  phoneVerified: false,
                  successfulExchanges: 0,
                  rating: 5.0
                };
                setUser(userData);
                setIsAuthenticated(true);
                setIsSessionRestoring(false); // Mark session restoration as complete
                return;
              }

              if (profile) {
                console.log('Fetched profile from database:', profile);
                const userData: User = {
                  id: profile.id,
                  email: profile.email || session.user.email || '',
                  name: profile.display_name || '',
                  profilePicture: profile.avatar_url,
                  bio: profile.bio,
                  country: profile.country,
                  age: profile.age,
                  age_range: (profile as any).age_range, // Type assertion for age_range
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
                console.log('Mapped user data:', userData);
                setUser(userData);
                setIsAuthenticated(true);
                setIsSessionRestoring(false); // Mark session restoration as complete
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
              // Set basic user data even if there's an error
              const userData: User = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || '',
                profilePicture: '',
                bio: '',
                country: '',
                age: undefined,
                age_range: '',
                gender: '',
                phone: '',
                skillsToTeach: [],
                skillsToLearn: [],
                willingToTeachWithoutReturn: false,
                userType: "free",
                remainingInvites: 3,
                appCoins: 50,
                phoneVerified: false,
                successfulExchanges: 0,
                rating: 5.0
              };
              setUser(userData);
              setIsAuthenticated(true);
              setIsSessionRestoring(false); // Mark session restoration as complete
            } finally {
              setIsLoadingProfile(false);
            }
          }, 100); // Small delay to allow profile updates to complete
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsSessionRestoring(false); // Mark session restoration as complete when no session
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session restoration check:', session?.user?.id);
      if (session) {
        setSession(session);
        // The auth state change listener will handle the rest and set isSessionRestoring to false
      } else {
        // No session found, mark restoration as complete after a small delay
        setTimeout(() => {
          console.log('No session found, marking restoration complete');
          setIsSessionRestoring(false);
        }, 500); // Small delay to ensure auth state is stable
      }
    });

    return () => subscription.unsubscribe();
  }, [user, isLoadingProfile]); // Add user and isLoadingProfile to dependencies

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
    try {
      console.log('Logout function called');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during logout:', error);
        throw error;
      } else {
        console.log('Logout successful');
      }
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      // Wait a bit to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Logout completed, state cleared');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      // Still clear state even if there's an error
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user && session) {
      console.log('Updating user with:', updates);
      
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
          age: null, // Keep age as null since we use age_range
          age_range: updatedUser.age_range,
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
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      } else {
        console.log('Profile updated successfully in database');
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      isLoading: isLoadingProfile, // Expose isLoadingProfile to the context
      isSessionRestoring, // Expose isSessionRestoring to the context
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