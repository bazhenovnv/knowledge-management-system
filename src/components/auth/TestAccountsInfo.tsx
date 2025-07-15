import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

export const TestAccountsInfo = () => {
  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon name="Info" size={16} className="text-blue-600" />
          Тестовые аккаунты для демонстрации
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>admin@example.com</span>
            <Badge variant="outline" className="text-xs">admin123</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>teacher@example.com</span>
            <Badge variant="outline" className="text-xs">teacher123</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>employee@example.com</span>
            <Badge variant="outline" className="text-xs">employee123</Badge>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Для зарегистрированных пользователей используйте созданный при регистрации пароль
        </p>
      </CardContent>
    </Card>
  );
};