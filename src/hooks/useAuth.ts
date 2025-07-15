import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  role?: string;
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
  
  const [userName, setUserName] = useState(() => {
    // Проверяем localStorage при инициализации
    const saved = localStorage.getItem("userName");
    return saved || "";
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
    role: "employee",
  });
  const [showRegister, setShowRegister] = useState(false);

  // Эффект для синхронизации с localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userName", userName);
  }, [isLoggedIn, userRole, userName]);

  const handleLogin = (email: string, password: string) => {
    let role: "employee" | "teacher" | "admin" = "employee";
    let name = "";
    
    if (email === "admin@example.com") {
      role = "admin";
      name = "Администратор";
    } else if (email === "teacher@example.com") {
      role = "teacher";
      name = "Преподаватель";
    } else {
      name = "Сотрудник";
    }
    
    setUserRole(role);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("employee");
    setUserName("");
    setLoginForm({ email: "", password: "" });
    
    // Очищаем localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
  };

  const handleRegister = (formData: RegisterForm) => {
    // Валидация данных
    if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.position) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Введите корректный email");
      return;
    }

    // Валидация пароля
    if (formData.password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }
    
    // Всегда устанавливаем роль "employee" для новых регистраций
    setUserRole("employee");
    setUserName(formData.name);
    setIsLoggedIn(true);
    setShowRegister(false);
    
    // Сбрасываем форму и устанавливаем роль "employee"
    setRegisterForm({
      name: "",
      department: "",
      position: "",
      email: "",
      password: "",
      role: "employee",
    });
    
    // В реальном приложении здесь был бы API вызов
    console.log("Зарегистрирован новый сотрудник:", {...formData, role: "employee"});
    toast.success(`Добро пожаловать, ${formData.name}!`);
  };

  const handlePasswordReset = (email: string) => {
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Введите корректный email");
      return;
    }
    
    // В реальном приложении здесь был бы API вызов
    console.log("Восстановление пароля для:", email);
    toast.success("Инструкции по восстановлению пароля отправлены на email");
  };

  return {
    isLoggedIn,
    userRole,
    userName,
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