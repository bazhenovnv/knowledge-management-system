import { useState, useEffect } from "react";
import { toast } from "sonner";
import { database } from "@/utils/database";

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
    // Проверяем тестовые аккаунты
    if (email === "admin@example.com") {
      setUserRole("admin");
      setUserName("Администратор");
      setIsLoggedIn(true);
      toast.success("Вход выполнен как Администратор");
      return;
    } else if (email === "teacher@example.com") {
      setUserRole("teacher");
      setUserName("Преподаватель");
      setIsLoggedIn(true);
      toast.success("Вход выполнен как Преподаватель");
      return;
    }

    // Ищем пользователя в базе данных
    const employee = database.findEmployeeByEmail(email);
    
    if (employee) {
      // В реальном приложении здесь была бы проверка пароля
      setUserRole(employee.role);
      setUserName(employee.name);
      setIsLoggedIn(true);
      toast.success(`Добро пожаловать, ${employee.name}!`);
    } else {
      toast.error("Пользователь с таким email не найден");
    }
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

    // Проверяем, существует ли уже сотрудник с таким email
    const existingEmployee = database.findEmployeeByEmail(formData.email);
    if (existingEmployee) {
      toast.error("Пользователь с таким email уже зарегистрирован");
      return;
    }
    
    try {
      // Сохраняем нового сотрудника в базе данных
      const newEmployee = database.saveEmployee({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        role: "employee", // Всегда устанавливаем роль "employee" для новых регистраций
        status: 3, // Средний статус по умолчанию
        tests: 0,
        avgScore: 0,
        score: 0,
        testResults: []
      });

      // Устанавливаем пользователя как авторизованного
      setUserRole("employee");
      setUserName(formData.name);
      setIsLoggedIn(true);
      setShowRegister(false);
      
      // Сбрасываем форму
      setRegisterForm({
        name: "",
        department: "",
        position: "",
        email: "",
        password: "",
        role: "employee",
      });
      
      toast.success(`Добро пожаловать, ${formData.name}! Вы зарегистрированы в системе.`);
      console.log("Новый сотрудник сохранен в базе данных:", newEmployee);
      
    } catch (error) {
      toast.error("Ошибка при регистрации. Попробуйте еще раз.");
      console.error("Ошибка регистрации:", error);
    }
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