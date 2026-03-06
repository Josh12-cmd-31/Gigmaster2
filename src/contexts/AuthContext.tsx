import { createContext, useContext, useState, useEffect } from 'react';
import { safeFetch } from '../utils/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
  referral_code?: string;
  balance?: number;
  is_premium?: number;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('gm_token');
      if (token) {
        try {
          const userData = await safeFetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (userData && !userData.error) {
            setUser(userData);
          } else {
            localStorage.removeItem('gm_token');
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          localStorage.removeItem('gm_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setUser(newUser);
    localStorage.setItem('gm_token', newToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gm_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
