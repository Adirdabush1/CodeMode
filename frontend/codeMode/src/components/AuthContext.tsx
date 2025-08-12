// AuthContext.tsx
import { createContext } from 'react';

export type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;     // הוספתי את loading לטייפ
  login: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
