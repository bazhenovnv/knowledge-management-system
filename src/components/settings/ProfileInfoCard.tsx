import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileInfoCardProps {
  employee: any;
  profileForm: {
    name: string;
    email: string;
    department: string;
    position: string;
    phone: string;
    avatar: string;
  };
  isUploadingPhoto: boolean;
  onProfileFormChange: (updates: Partial<ProfileInfoCardProps['profileForm']>) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileInfoCard({
  employee,
  profileForm,
  isUploadingPhoto,
  onProfileFormChange,
  onPhotoUpload,
  onSubmit
}: ProfileInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="User" size={20} className="mr-2 text-blue-600" />
          Основная информация
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            {profileForm.avatar ? (
              <img 
                src={profileForm.avatar} 
                alt="Фото профиля" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {employee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={onPhotoUpload}
                disabled={isUploadingPhoto}
              />
              <Button 
                type="button" 
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploadingPhoto}
              >
                <Icon name={isUploadingPhoto ? "Loader2" : "Upload"} size={14} className={`mr-2 ${isUploadingPhoto ? 'animate-spin' : ''}`} />
                {isUploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}
              </Button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG или GIF. Макс 2MB</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Полное имя *</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => onProfileFormChange({ name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Для смены email обратитесь к администратору
              </p>
            </div>

            <div>
              <Label htmlFor="department">Отдел</Label>
              <Select 
                value={profileForm.department}
                onValueChange={(value) => onProfileFormChange({ department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Отдел IT">Отдел IT</SelectItem>
                  <SelectItem value="Сервис">Сервис</SelectItem>
                  <SelectItem value="ЦТО">ЦТО</SelectItem>
                  <SelectItem value="Продажи">Продажи</SelectItem>
                  <SelectItem value="Маркетинг">Маркетинг</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Администрация">Администрация</SelectItem>
                  <SelectItem value="Учебный отдел">Учебный отдел</SelectItem>
                  <SelectItem value="Общий отдел">Общий отдел</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Должность</Label>
              <Input
                id="position"
                value={profileForm.position}
                onChange={(e) => onProfileFormChange({ position: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => onProfileFormChange({ phone: e.target.value })}
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div>
              <Label>Роль</Label>
              <Input value={employee.role} disabled />
            </div>
          </div>

          <Separator />

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Icon name="Info" size={16} className="mr-2 text-blue-600" />
              Дополнительная информация
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">ID пользователя:</span>
                <p className="font-medium">{employee.id}</p>
              </div>
              <div>
                <span className="text-gray-600">Статус:</span>
                <p className="font-medium">{employee.isActive ? '🟢 Активен' : '🔴 Неактивен'}</p>
              </div>
              <div>
                <span className="text-gray-600">Дата регистрации:</span>
                <p className="font-medium">{new Date(employee.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
              <div>
                <span className="text-gray-600">Последний вход:</span>
                <p className="font-medium">
                  {employee.lastLoginAt 
                    ? new Date(employee.lastLoginAt).toLocaleDateString('ru-RU')
                    : 'Не входил'
                  }
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить изменения профиля
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
