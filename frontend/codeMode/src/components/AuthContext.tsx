// src/components/AuthContext.tsx
import { createContext } from 'react';

export type User = {
  _id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  // הוסף שדות נוספים שמגיעים מה־API (title, points, וכו')
};

export type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
