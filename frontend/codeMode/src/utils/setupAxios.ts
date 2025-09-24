// src/utils/setupAxios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-codemode-9p1s.onrender.com", // כתובת השרת שלך
  withCredentials: true, // שולח cookies ובקרת session
});

// ✅ Interceptor לבקשות — אפשר להוסיף טוקן אם יש
api.interceptors.request.use(
  (config) => {
    // אם יש לך JWT בלוקאל סטורג' לדוגמה:
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor לתשובות — לטיפול בשגיאות גלובליות
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API error:", error.response.status, error.response.data);
      // דוגמה: אם השרת מחזיר 401 → המשתמש לא מחובר
      if (error.response.status === 401) {
        // אפשר לנקות טוקן או להפנות לדף התחברות
        localStorage.removeItem("token");
      }
    } else {
      console.error("API error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
