import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import type { User } from "../types";
import type { CurrentUserResponse } from "../types/api";

import {
  login as loginApi,
  getCurrentUser,
} from "../services/authService";
import { mapBackendRoleToFrontend } from "../mappers/roleMapper";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "resolve_auth_user";
const TOKEN_KEY = "access_token";

function mapApiUserToUser(currentUser: CurrentUserResponse): User {
  return {
    id: currentUser.user_id.toString(),
    name: currentUser.name,
    email: currentUser.email,
    role: mapBackendRoleToFrontend(currentUser.role),
    studentId: currentUser.register_no ?? undefined,
    phone: currentUser.phone ?? undefined,
    department: currentUser.department_name ?? undefined,
    joinedAt: currentUser.created_at ?? "",
    lastActive: "",
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (mappedUser: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
    setUser(mappedUser);
  };

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    persistUser(mapApiUserToUser(currentUser));
  };

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const tokenResponse = await loginApi(email, password);

    localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);

    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
