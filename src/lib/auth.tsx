import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getToken,
  setToken as persistToken,
  getStoredUser,
  setStoredUser,
  userFromToken,
  type StoredUser,
} from "./api";

interface AuthContextValue {
  token: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  loaded: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  setUserState: (user: StoredUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (t) {
      setTokenState(t);
      setUserState(getStoredUser() ?? userFromToken(t));
    }
    setLoaded(true);
  }, []);

  const signIn = (t: string) => {
    persistToken(t);
    const u = userFromToken(t);
    setStoredUser(u);
    setTokenState(t);
    setUserState(u);
  };

  const signOut = () => {
    persistToken(null);
    setStoredUser(null);
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, loaded, signIn, signOut, setUserState }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
