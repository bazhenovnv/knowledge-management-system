import { useState, useEffect } from "react";

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  department: string;
  position: string;
  email: string;
  password: string;
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Проверяем localStorage при инициализации
    const saved = localStorage.getItem("isLoggedIn");
    return saved === "true";
  });
  
  const [userRole, setUserRole] = useState<"employee" | "teacher" | "admin">(() => {
    // Проверяем localStorage при инициализации
    const saved = localStorage.getItem("userRole");
    return (saved as "employee" | "teacher" | "admin") || "employee";
  });
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    department: "",
    position: "",
    email: "",
    password: "",
  });
  const [showRegister, setShowRegister] = useState(false);

  // Эффект для синхронизации с localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
    localStorage.setItem("userRole", userRole);
  }, [isLoggedIn, userRole]);

  const handleLogin = (email: string, password: string) => {
    let role: "employee" | "teacher" | "admin" = "employee";
    
    if (email === "admin@example.com") {
      role = "admin";
    } else if (email === "teacher@example.com") {
      role = "teacher";
    }
    
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("employee");
    setLoginForm({ email: "", password: "" });
    
    // Очищаем localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
  };

  const handleRegister = (formData: RegisterForm) => {
    setUserRole("employee");
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handlePasswordReset = (email: string) => {
    // Здесь будет логика восстановления пароля
    console.log("Восстановление пароля для:", email);
    // В реальном приложении здесь бы был запрос к API
  };

  return {
    isLoggedIn,
    userRole,
    loginForm,
    registerForm,
    showRegister,
    setLoginForm,
    setRegisterForm,
    setShowRegister,
    handleLogin,
    handleLogout,
    handleRegister,
    handlePasswordReset,
  };
};