import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "GUEST" | "BIDDER" | "SELLER" | "ADMIN";
  rating?: {
    positive: number;
    negative: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, captcha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/refresh-token`, {
        method: "POST",
        credentials: "include", // Important: send refresh token cookie
      });

      if (!response.ok) {
        // Refresh token is invalid or expired
        setUser(null);
        return false;
      }

      // Fetch updated user info after token refresh
      const userResponse = await fetch(`${BACKEND_URL}/whoami`, {
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          setUser({
            id: userData.user.userId || userData.user.id,
            email: userData.user.email,
            fullName: userData.user.fullName,
            role: userData.user.role,
            rating: userData.user.rating,
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      setUser(null);
      return false;
    }
  };

  // Fetch current user from httpOnly cookie on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/whoami`, {
          credentials: "include", // Important: include httpOnly cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser({
              id: data.user.userId || data.user.id,
              email: data.user.email,
              fullName: data.user.fullName,
              role: data.user.role,
              rating: data.user.rating,
            });
          }
        } else if (response.status === 401) {
          // Access token expired, try to refresh
          console.log("Access token expired, attempting to refresh...");
          await refreshAccessToken();
          // If refresh succeeds, user will be set by refreshAccessToken
          // If it fails, user stays null (logged out)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [BACKEND_URL]);

  const login = async (email: string, password: string, captcha: string) => {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important: allow cookies to be set
      body: JSON.stringify({ email, password, captcha }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    // Fetch user info after successful login (since tokens are in httpOnly cookies)
    const userResponse = await fetch(`${BACKEND_URL}/whoami`, {
      credentials: "include",
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      if (userData.user) {
        setUser({
          id: userData.user.userId || userData.user.id,
          email: userData.user.email,
          fullName: userData.user.fullName,
          role: userData.user.role,
          rating: userData.user.rating,
        });
      }
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include", // Important: send cookies to be cleared
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
