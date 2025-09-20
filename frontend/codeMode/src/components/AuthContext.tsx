// AuthContext.tsx
import { createContext } from 'react';

export type User = {
  _id: string;
  name: string;
  email?: string;
   avatarUrl?: string;
  // תוסיף כאן עוד שדות אם אתה מקבל מהשרת
};

export type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
