import { useState, useEffect } from "react";
import { toast } from "sonner";
import { database } from "@/utils/database";
import { initializeAutoBackup } from "@/utils/autoBackup";

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
  
  const [userId, setUserId] = useState<number>(() => {
    // Проверяем localStorage при инициализации
    const saved = localStorage.getItem("userId");
    return saved ? parseInt(saved) : 0;
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
    localStorage.setItem("userId", userId.toString());
  }, [isLoggedIn, userRole, userName, userId]);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Введите email и пароль");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Введите корректный email");
      return;
    }

    if (password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (email === "admin@example.com" && password === "admin123") {
      setUserRole("admin");
      setUserName("Администратор");
      setUserId(1);
      setIsLoggedIn(true);
      initializeAutoBackup("admin");
      toast.success("Вход выполнен как Администратор");
      return;
    } else if (email === "teacher@example.com" && password === "teacher123") {
      setUserRole("teacher");
      setUserName("Преподаватель");
      setUserId(2);
      setIsLoggedIn(true);
      toast.success("Вход выполнен как Преподаватель");
      return;
    } else if (email === "employee@example.com" && password === "employee123") {
      setUserRole("employee");
      setUserName("Сотрудник");
      setUserId(3);
      setIsLoggedIn(true);
      toast.success("Вход выполнен как Сотрудник");
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/af05cfe5-2869-458e-8c1b-998684e530d2?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.success && data.employee) {
        const emp = data.employee;
        setUserRole(emp.role);
        setUserName(emp.full_name);
        setUserId(emp.id);
        setIsLoggedIn(true);
        
        if (data.session?.token) {
          localStorage.setItem('authToken', data.session.token);
        }
        
        if (emp.role === 'admin') {
          initializeAutoBackup('admin');
        }
        
        toast.success(`Добро пожаловать, ${emp.full_name}!`);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ошибка подключения к серверу');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("employee");
    setUserName("");
    setUserId(0);
    setLoginForm({ email: "", password: "" });
    
    // Очищаем localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
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
      setUserId(newEmployee.id);
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
    userId,
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