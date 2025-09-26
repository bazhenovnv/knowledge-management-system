import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import authService from '@/utils/authService';

export default function TestRegister() {
  const [formData, setFormData] = useState({
    email: 'user' + Math.floor(Math.random() * 1000) + '@company.com',
    password: 'password123',
    full_name: 'Тестовый Пользователь',
    phone: '+7 (999) 123-45-67',
    department: 'IT',
    position: 'Разработчик',
    role: 'employee'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const result = await authService.register(formData);
      toast.success('Регистрация прошла успешно!');
      console.log('Registration result:', result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка регистрации');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomEmail = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    setFormData(prev => ({ ...prev, email: `user${randomNum}@company.com` }));
  };

  return (
    <div className="p-6 max-w-md mx-auto border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Тест регистрации</h2>
      
      <div className="space-y-4">
        <div>
          <Label>Email</Label>
          <div className="flex gap-2">
            <Input
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <Button size="sm" onClick={generateRandomEmail} variant="outline">
              🎲
            </Button>
          </div>
        </div>

        <div>
          <Label>Пароль</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
          />
        </div>

        <div>
          <Label>Полное имя</Label>
          <Input
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
          />
        </div>

        <div>
          <Label>Телефон</Label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>

        <div>
          <Label>Отдел</Label>
          <Input
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
          />
        </div>

        <div>
          <Label>Должность</Label>
          <Input
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleRegister} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </div>
    </div>
  );
}