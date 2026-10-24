import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  role: string;
}

interface AuthCtx {
  user: User | null;
  refresh: () => void;  
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  refresh: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refresh = () => {
    const token = localStorage.getItem('token');
    if (!token) return setUser(null);

    try {
      const payload = jwtDecode<{ sub: string; role: string }>(token);
      setUser({ id: payload.sub, role: payload.role });
    } catch {
      setUser(null);
    }
  };

  useEffect(refresh, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
