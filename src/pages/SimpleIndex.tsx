import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { getDefaultEmployees, getCurrentUser, SimpleEmployee } from '@/utils/simpleData';
import { Footer } from '@/components/layout/Footer';

export default function SimpleIndex() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees] = useState<SimpleEmployee[]>(getDefaultEmployees());
  const [searchQuery] = useState('');
  const currentEmployee = getCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  const filteredEmployees = employees.filter(emp => {
    const name = emp.full_name || '';
    const email = emp.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentEmployee.role === 'admin') {
          return <AdminDashboard employees={filteredEmployees} />;
        } else if (currentEmployee.role === 'teacher') {
          return <TeacherDashboard employees={filteredEmployees} />;
        } else {
          return <EmployeeDashboard employee={currentEmployee} />;
        }
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Добро пожаловать в систему управления обучением!
            </h2>
            <p className="text-gray-600">
              Выберите раздел в навигации для работы с системой.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        userRole={currentEmployee.role}
        userName={currentEmployee.full_name}
        isAuthenticated={true}
      />
      
      <div className="pt-8">
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
}