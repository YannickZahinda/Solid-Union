import { LoginResponse } from "@/services/authService";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  accessToken: string;
  //   properties?: any;
  //   products?: any;
}

interface AuthContextType {
  user: User | null;
  login: (response: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    console.log(
      "Initial auth check - Access token: ",
      token ? "exists" : "not found"
    );
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.exp * 1000 < Date.now()) {
          setUser(null);
        } else {
          setUser({
            id: decoded.id,
            fullName: decoded.fullName,
            email: decoded.email,
            role: decoded.role,
            accessToken: token,
          });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        setUser(null);
        localStorage.removeItem("jwtToken");
      }
    }
  }, []);


  const login = (response: LoginResponse) => {
    localStorage.setItem("jwtToken", response.access_token);
    const token = response.access_token;
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUser({
      id: decoded.sub,
      fullName: decoded.fullName,
      email: decoded.email,
      role: decoded.role,
      accessToken: token,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jwtToken");
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
};
