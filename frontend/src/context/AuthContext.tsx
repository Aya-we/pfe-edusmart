"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  schoolId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  schoolLogo: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API = process.env.NEXT_PUBLIC_API_URL || "https://edusmart-dy4i.onrender.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    if (user?.schoolId && pathname?.startsWith('/dashboard')) {
      axios.get(`${API}/schools/${user.schoolId}`).then((res) => {
        setSchoolLogo(res.data.logo || null);
        const themeSettings = res.data.themeSettings;
        if (themeSettings) {
          try {
            const settings = typeof themeSettings === "string" ? JSON.parse(themeSettings) : themeSettings;
            if (settings.primary) {
              document.documentElement.style.setProperty('--primary', settings.primary);
              
              // Calculate contrast for text
              const hex = settings.primary.replace('#', '');
              if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                document.documentElement.style.setProperty('--primary-foreground', yiq >= 128 ? '#000000' : '#ffffff');
              }
            }
            if (settings.background) {
              document.documentElement.style.setProperty('--background', settings.background);
            }
          } catch (e) {
            console.error("Failed to parse theme settings", e);
          }
        }
      }).catch(err => console.error(err));
    } else {
      // Nettoyer le thème si on n'est pas dans le dashboard (ex: Page d'accueil)
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-foreground');
      document.documentElement.style.removeProperty('--background');
    }
  }, [user, pathname]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user } = response.data;
      
      setToken(access_token);
      setUser(user);
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Redirection selon le rôle
      if (user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (user.role === "TEACHER") {
        router.push("/dashboard/teacher");
      } else if (user.role === "PARENT") {
        router.push("/dashboard/parent");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, schoolLogo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

