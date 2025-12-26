// יצירת קובץ נפרד לטיפוסים - מומלץ ליצור אותו ב-src/user/user.types.ts

import { Document } from 'mongoose';

// ממשק המשתמש הבסיסי
export interface User {
  email: string;
  password: string;
  name?: string;
}

// ממשק למסמך משתמש מ-MongoDB
export interface UserDocument extends User, Document {
  _id: string;
}

// ממשק למשתמש מאומת (ללא סיסמה)
export interface AuthenticatedUser {
  email: string;
  id: string;
}

// ממשק לטוקן JWT
export interface JwtPayload {
  email: string;
  sub: string;
}
