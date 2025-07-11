import { useState } from "react";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"employee" | "teacher" | "admin">(
    "employee",
  );
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

  const handleLogin = (email: string, password: string) => {
    if (email === "admin@example.com") {
      setUserRole("admin");
    } else if (email === "teacher@example.com") {
      setUserRole("teacher");
    } else {
      setUserRole("employee");
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("employee");
    setLoginForm({ email: "", password: "" });
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
