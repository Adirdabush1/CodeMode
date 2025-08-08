import { createContext } from 'react';

export type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
