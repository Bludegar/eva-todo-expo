import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import api, { loadStoredToken, saveStoredToken, removeStoredToken, setToken } from '../services/api';

// contexto simple de autenticacion
// los comentarios estan en espanol sin tildes ni mayusculas

type AuthContextType = {
  user: User | null;
  token: string | null;
  // login recibe email y password y llama al backend
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializing: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  initializing: true,
});

const STORAGE_KEY = 'eva_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setLocalToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // cargar usuario y token desde storage al iniciar
    (async () => {
      try {
        const uRaw = await AsyncStorage.getItem(STORAGE_KEY);
        if (uRaw) setUser(JSON.parse(uRaw));
        const t = await loadStoredToken();
        if (t) {
          setLocalToken(t);
          setToken(t);
        }
      } catch (e) {
        // ignore
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    // llamar al backend para autenticar
    try {
      const res: any = await api.loginRequest(email, password);
      // esperar que la respuesta contenga token y optionalmente user
      const tokenResp = res?.token || res?.accessToken || res?.data?.token;
      const userResp = res?.user || res?.data?.user;
      if (!tokenResp) throw new Error('token not returned by server');

      await saveStoredToken(tokenResp);
      setLocalToken(tokenResp);
      setToken(tokenResp);

      // guardar user en storage local (solo para mostrar nombre)
      const u: User = userResp ? { id: userResp.id ?? userResp.username ?? email, username: userResp.username ?? userResp.email ?? email } : { id: email, username: email };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
    } catch (e: any) {
      // propagar error para mostrar en UI
      throw e;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await removeStoredToken();
    setLocalToken(null);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, initializing }}>{children}</AuthContext.Provider>
  );
};
