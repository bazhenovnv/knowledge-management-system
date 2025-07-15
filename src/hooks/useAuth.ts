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
    // Обязательная проверка полей
    if (!email || !password) {
      toast.error("Введите email и пароль");
      return;
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Введите корректный email");
      return;
    }

    // Проверка минимальной длины пароля
    if (password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    // Проверяем тестовые аккаунты с паролем
    if (email === "admin@example.com" && password === "admin123") {
      setUserRole("admin");
      setUserName("Администратор");
      setIsLoggedIn(true);
      toast.success("Вход выполнен как Администратор");
      return;
    } else if (email === "teacher@example.com" && password === "teacher123") {
      setUserRole("teacher");
      setUserName("Преподаватель");
      setIsLoggedIn(true);
      toast.success("Вход выполнен как Преподаватель");
      return;
    } else if (email === "employee@example.com" && password === "employee123") {
      setUserRole("employee");
      setUserName("Сотрудник");
      setIsLoggedIn(true);
      toast.success("Вход выполнен как Сотрудник");
      return;
    }

    // Ищем пользователя в базе данных
    const employee = database.findEmployeeByEmail(email.toLowerCase());
    
    if (!employee) {
      toast.error("Пользователь с таким email не найден");
      return;
    }

    // Проверка пароля
    // Если у пользователя есть сохраненный пароль, используем его
    // Иначе используем временное правило: email без @domain как пароль
    const expectedPassword = employee.password || employee.email.split('@')[0];
    
    if (password !== expectedPassword) {
      toast.error("Неверный пароль");
      return;
    }

    // Успешный вход
    setUserRole(employee.role);
    setUserName(employee.name);
    setIsLoggedIn(true);
    toast.success(`Добро пожаловать, ${employee.name}!`);
    
    // Обновляем время последнего входа
    database.updateEmployee(employee.id, { lastLoginAt: new Date() });
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

    // Расширенная валидация пароля
    if (formData.password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }
    
    // Проверка на сложность пароля
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      toast.warning("Рекомендуется использовать пароль с заглавными и строчными буквами, а также цифрами");
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
        email: formData.email.toLowerCase(), // Приводим email к нижнему регистру
        department: formData.department,
        position: formData.position,
        role: "employee", // Всегда устанавливаем роль "employee" для новых регистраций
        status: 3, // Средний статус по умолчанию
        tests: 0,
        avgScore: 0,
        score: 0,
        testResults: [],
        lastLoginAt: new Date(), // Время регистрации как первый вход
        isActive: true, // Активный статус по умолчанию
        password: formData.password // Сохраняем пароль (в реальном приложении нужно хэшировать)
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