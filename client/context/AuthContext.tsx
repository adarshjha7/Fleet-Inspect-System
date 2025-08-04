import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "driver" | "admin";

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isDriver: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock users for demo
const mockUsers: Record<string, { password: string; user: User }> = {
  driver1: {
    password: "driver123",
    user: { id: "1", name: "John Driver", role: "driver" },
  },
  driver2: {
    password: "driver123",
    user: { id: "2", name: "Jane Driver", role: "driver" },
  },
  admin: {
    password: "admin123",
    user: { id: "3", name: "Admin User", role: "admin" },
  },
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem("fleetinspect_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    const userAccount = mockUsers[username];
    if (userAccount && userAccount.password === password) {
      setUser(userAccount.user);
      localStorage.setItem(
        "fleetinspect_user",
        JSON.stringify(userAccount.user),
      );
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fleetinspect_user");
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isDriver: user?.role === "driver",
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
