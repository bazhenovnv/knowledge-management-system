import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import authService, { Employee } from '@/utils/authService';

interface UserNavbarProps {
  employee: Employee;
  onLogout: () => void;
}

export default function UserNavbar({ employee, onLogout }: UserNavbarProps) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role display text
  const getRoleText = (role: string): string => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'employee': return 'Сотрудник';
      default: return role;
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'manager': return 'text-blue-600 bg-blue-100';
      case 'employee': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleLogout = async (allSessions: boolean = false) => {
    setIsLoggingOut(true);
    
    try {
      await authService.logout(allSessions);
      toast.success(allSessions ? 'Выход из всех устройств выполнен' : 'Выход выполнен успешно');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Ошибка при выходе из системы');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        {/* User info */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-900">{employee.full_name}</p>
          <div className="flex items-center justify-end space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(employee.role)}`}>
              {getRoleText(employee.role)}
            </span>
            {employee.department && (
              <span className="text-xs text-gray-500">{employee.department}</span>
            )}
          </div>
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={employee.avatar_url} alt={employee.full_name} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {getInitials(employee.full_name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end">
            {/* User info (mobile) */}
            <div className="md:hidden px-2 py-2">
              <p className="text-sm font-medium">{employee.full_name}</p>
              <p className="text-xs text-gray-500">{employee.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(employee.role)}`}>
                  {getRoleText(employee.role)}
                </span>
                {employee.department && (
                  <span className="text-xs text-gray-500">{employee.department}</span>
                )}
              </div>
            </div>
            
            <DropdownMenuSeparator className="md:hidden" />
            
            <DropdownMenuItem className="cursor-pointer">
              <Icon name="User" size={16} className="mr-2" />
              Профиль
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout confirmation dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выйти из системы?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите выйти из системы? Вам потребуется снова войти для доступа к функциям управления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel disabled={isLoggingOut}>
              Отмена
            </AlertDialogCancel>
            
            <Button
              variant="outline"
              onClick={() => handleLogout(true)}
              disabled={isLoggingOut}
              className="w-full sm:w-auto"
            >
              {isLoggingOut ? (
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              ) : (
                <Icon name="Smartphone" size={16} className="mr-2" />
              )}
              Выйти везде
            </Button>
            
            <AlertDialogAction
              onClick={() => handleLogout(false)}
              disabled={isLoggingOut}
              className="w-full sm:w-auto"
            >
              {isLoggingOut ? (
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              ) : (
                <Icon name="LogOut" size={16} className="mr-2" />
              )}
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}