// AuthContext.tsx - Fixed to work with current authUtils
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getUserInfoFromCookie,
  getUserInfoFromEndpoint,
  logout as authUtilsLogout,
} from "../../utils/authUtils";

// Define UserInfo interface locally since it's not exported from authUtils
export interface UserInfo {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  setUser: (user: UserInfo | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}
const getUserInfo = async (): Promise<UserInfo | null> => {
  let userInfo = getUserInfoFromCookie();
  if (userInfo) {
    return userInfo;
  }

  // If not in cookie, try endpoint
  userInfo = await getUserInfoFromEndpoint();
  if (userInfo) {
    return userInfo;
  }

  return null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user info from any available source
  const refreshUser = async () => {
    setLoading(true);
    try {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    // Use the logout function from authUtils
    authUtilsLogout();
  };

  // Initialize user info on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    loading,
    setUser,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
