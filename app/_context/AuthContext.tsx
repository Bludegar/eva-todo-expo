import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../_types';

// contexto simple de autenticacion
// los comentarios estan en espanol sin tildes ni mayusculas

type AuthContextType = {
  user: User | null;
  // login recibe email (se valida en la pantalla de login)
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
});

const STORAGE_KEY = 'eva_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // cargar usuario desde storage al iniciar
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v) setUser(JSON.parse(v));
    });
  }, []);

  const login = async (email: string) => {
    // nota: login simulado, guardamos el email como id y username
    const u: User = { id: email, username: email };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  );
};
