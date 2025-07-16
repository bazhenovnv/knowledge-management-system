import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { LoginForm, RegisterForm } from "@/hooks/useAuth";
import { DEPARTMENTS } from "@/constants/departments";
import { TestAccountsInfo } from "./TestAccountsInfo";
import { useState } from "react";

interface AuthFormProps {
  showRegister: boolean;
  loginForm: LoginForm;
  registerForm: RegisterForm;
  onLoginFormChange: (form: LoginForm) => void;
  onRegisterFormChange: (form: RegisterForm) => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (form: RegisterForm) => void;
  onToggleRegister: () => void;
  onPasswordReset?: (email: string) => void;
}

export const AuthForm = ({
  showRegister,
  loginForm,
  registerForm,
  onLoginFormChange,
  onRegisterFormChange,
  onLogin,
  onRegister,
  onToggleRegister,
  onPasswordReset,
}: AuthFormProps) => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handlePasswordReset = () => {
    if (resetEmail) {
      onPasswordReset?.(resetEmail);
      setResetSent(true);
      setTimeout(() => {
        setShowPasswordReset(false);
        setResetSent(false);
        setResetEmail("");
      }, 3000);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6">
        {/* Заголовки системы */}
        <div className="text-center space-y-2">
          <h1 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-[#000000] text-lg">
            Корпоративное обучение
          </h1>
          <p className="text-gray-600 font-medium py-0 px-0 text-lg">
            Система управления знаниями сотрудников
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="https://cdn.poehali.dev/files/559b1a38-bc91-4187-8a3f-b47c1947c45c.png" 
                alt="Логотип" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {showPasswordReset
                ? "Восстановление пароля"
                : showRegister
                  ? "Регистрация"
                  : "Вход в систему"}
            </CardTitle>
            <CardDescription>
              {showPasswordReset
                ? "Введите ваш email для восстановления пароля"
                : showRegister
                  ? "Создайте аккаунт для доступа к системе"
                  : "Введите свои данные для входа"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showPasswordReset ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Введите ваш email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                {resetSent ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Icon
                      name="CheckCircle"
                      size={24}
                      className="mx-auto text-green-600 mb-2"
                    />
                    <p className="text-green-800 font-medium">
                      Письмо отправлено!
                    </p>
                    <p className="text-green-600 text-sm">
                      Проверьте ваш email для инструкций по восстановлению
                      пароля
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handlePasswordReset}
                    disabled={!resetEmail}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Отправить инструкции
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordReset(false)}
                  className="w-full"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад к входу
                </Button>
              </>
            ) : showRegister ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    placeholder="Введите имя"
                    value={registerForm.name}
                    onChange={(e) =>
                      onRegisterFormChange({
                        ...registerForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Отдел</Label>
                  <Select
                    value={registerForm.department}
                    onValueChange={(value) =>
                      onRegisterFormChange({
                        ...registerForm,
                        department: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите отдел" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    placeholder="Введите должность"
                    value={registerForm.position}
                    onChange={(e) =>
                      onRegisterFormChange({
                        ...registerForm,
                        position: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Введите email"
                    value={registerForm.email}
                    onChange={(e) =>
                      onRegisterFormChange({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={registerForm.password}
                    onChange={(e) =>
                      onRegisterFormChange({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={() => onRegister(registerForm)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Зарегистрироваться
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Введите email"
                    value={loginForm.email}
                    onChange={(e) =>
                      onLoginFormChange({ ...loginForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={loginForm.password}
                    onChange={(e) =>
                      onLoginFormChange({
                        ...loginForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="text-right">
                  <Button
                    variant="link"
                    onClick={() => setShowPasswordReset(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                  >
                    Забыли пароль?
                  </Button>
                </div>
                <Button
                  onClick={() => onLogin(loginForm.email, loginForm.password)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Войти в систему
                </Button>

              </>
            )}
            {!showPasswordReset && (
              <Button
                variant="outline"
                onClick={onToggleRegister}
                className="w-full"
              >
                {showRegister
                  ? "Уже есть аккаунт? Войти"
                  : "Нет аккаунта? Зарегистрироваться"}
              </Button>
            )}
          </CardContent>
        </Card>
        {!showRegister && !showPasswordReset && <TestAccountsInfo />}
      </div>
    </div>
  );
};