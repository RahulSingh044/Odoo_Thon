"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* =======================
   Types
======================= */
type Role = "ADMIN" | "EMPLOYEE";

type User = {
  id: string;
  name: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isEmployee: boolean;
  loading: boolean;
  logout: () => void;
};

/* =======================
   Context
======================= */
const AuthContext = createContext<AuthContextType | null>(null);

/* =======================
   Provider
======================= */
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "ADMIN",
        isEmployee: user?.role === "EMPLOYEE",
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

/* =======================
   Hook
======================= */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
