import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  country?: string;
  skillsToTeach: Array<{
    name: string;
    level: string;
    description: string;
  }>;
  skillsToLearn: string[];
  willingToTeachWithoutReturn: boolean;
  userType: "free" | "premium";
  remainingInvites: number;
  appCoins: number;
  phoneVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    console.log("Logging in:", email);
    
    // Mock user data
    const mockUser: User = {
      id: "user-1",
      email,
      name: "John Doe",
      profilePicture: "👨‍💻",
      bio: "Passionate learner and teacher",
      country: "United States",
      skillsToTeach: [
        { name: "JavaScript", level: "Expert", description: "Full-stack development" }
      ],
      skillsToLearn: ["Spanish", "Guitar"],
      willingToTeachWithoutReturn: false,
      userType: "free",
      remainingInvites: 3,
      appCoins: 50,
      phoneVerified: false
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const signup = async (userData: any) => {
    console.log("Signing up:", userData);
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      profilePicture: "👤",
      bio: userData.bio,
      country: userData.country,
      skillsToTeach: userData.skillsToTeach || [],
      skillsToLearn: userData.skillsToLearn || [],
      willingToTeachWithoutReturn: userData.willingToTeachWithoutReturn || false,
      userType: "free",
      remainingInvites: 3,
      appCoins: userData.willingToTeachWithoutReturn ? 100 : 50, // Bonus for mentors
      phoneVerified: false
    };

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      signup,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};