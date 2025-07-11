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

interface AuthFormProps {
  showRegister: boolean;
  loginForm: LoginForm;
  registerForm: RegisterForm;
  onLoginFormChange: (form: LoginForm) => void;
  onRegisterFormChange: (form: RegisterForm) => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (form: RegisterForm) => void;
  onToggleRegister: () => void;
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
}: AuthFormProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6">
        {/* Заголовки системы */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Корпоративное обучение
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Система управления знаниями сотрудников
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {showRegister ? "Регистрация" : "Вход в систему"}
            </CardTitle>
            <CardDescription>
              {showRegister
                ? "Создайте аккаунт для доступа к системе"
                : "Введите свои данные для входа"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showRegister ? (
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
                      <SelectItem value="it">ИТ</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Финансы</SelectItem>
                      <SelectItem value="marketing">Маркетинг</SelectItem>
                      <SelectItem value="operations">Операции</SelectItem>
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
                <Button
                  onClick={() => onLogin(loginForm.email, loginForm.password)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Войти в систему
                </Button>
                <div className="text-center text-sm text-gray-600">
                  <p>Тестовые аккаунты:</p>
                  <p>admin@example.com - администратор</p>
                  <p>teacher@example.com - преподаватель</p>
                  <p>employee@example.com - сотрудник</p>
                </div>
              </>
            )}
            <Button
              variant="outline"
              onClick={onToggleRegister}
              className="w-full"
            >
              {showRegister
                ? "Уже есть аккаунт? Войти"
                : "Нет аккаунта? Зарегистрироваться"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
