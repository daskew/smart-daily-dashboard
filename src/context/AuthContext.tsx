import { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = '/api/auth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem('dashboard-user');
    const storedToken = localStorage.getItem('dashboard-token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Validate token
      fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      }).then(res => {
        if (!res.ok) {
          logout();
        }
      }).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    localStorage.setItem('dashboard-token', data.token);
    localStorage.setItem('dashboard-user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    localStorage.setItem('dashboard-token', data.token);
    localStorage.setItem('dashboard-user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('dashboard-token');
    localStorage.removeItem('dashboard-user');
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem('dashboard-token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
