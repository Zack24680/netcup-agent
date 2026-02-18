import { useState, useEffect, createContext, useContext } from 'react';
import { auth as authApi } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hs_token');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('hs_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem('hs_token', token);
    setUser(user);
  }

  async function register(email, password) {
    const { token, user } = await authApi.register(email, password);
    localStorage.setItem('hs_token', token);
    setUser(user);
  }

  async function logout() {
    await authApi.logout().catch(() => {});
    localStorage.removeItem('hs_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
