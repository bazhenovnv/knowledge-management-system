import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { database } from "@/utils/database";
import { toast } from "sonner";

import { TopEmployees } from "@/components/employees/TopEmployees";
import NotificationForm from "@/components/notifications/NotificationForm";
import { useData } from "@/contexts/DataContext";
import { TeacherStats } from "./TeacherStats";
import { ActiveStudentsList } from "./ActiveStudentsList";
import { DataExportImport } from "./DataExportImport";
import { 
  handleExportTestResults, 
  handleExportStudents, 
  handleImportStudents 
} from "./teacherDashboardUtils";

interface TeacherDashboardProps {
  onLogout: () => void;
  employees: any[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const TeacherDashboard = ({
  onLogout,
  employees,
  getStatusColor,
  getStatusText,
}: TeacherDashboardProps) => {
  const { stats: contextStats, isLoading, refreshData } = useData();
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [selectedStudentForNotification, setSelectedStudentForNotification] = useState<any>(null);

  const students = contextStats?.employees
    ?.filter((emp: any) => emp.role === 'employee' && emp.is_active)
    .map((emp: any) => ({
      id: emp.id,
      name: emp.full_name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      role: emp.role,
      status: 4
    })) || [];

  const stats = {
    totalStudents: students.length,
    createdTests: 0,
    averageScore: contextStats?.averageScore || 0,
    activeStudents: students.length
  };

  useEffect(() => {
    if (!contextStats) {
      refreshData();
    }
  }, []);

  const handleDeleteStudent = (studentId: number) => {
    const student = employees.find(emp => emp.id === studentId);
    if (student) {
      try {
        const success = database.deleteEmployee(studentId);
        
        if (success) {
          setDeleteStudentId(null);
          toast.success(`Студент ${student.name} удален из системы`);
          window.location.reload();
        } else {
          toast.error("Студент не найден в базе данных");
        }
      } catch (error) {
        toast.error("Ошибка при удалении студента");
        console.error("Ошибка удаления:", error);
      }
    }
  };

  const handleViewProfile = (student: any) => {
    toast.info(`Просмотр профиля: ${student.name}`);
  };

  const handleAssignTask = (student: any) => {
    toast.success(`Задание отправлено студенту ${student.name}`);
  };

  const handleSendNotification = (student: any) => {
    setSelectedStudentForNotification(student);
    setNotificationFormOpen(true);
  };

  const handleBulkNotification = () => {
    setSelectedStudentForNotification(null);
    setNotificationFormOpen(true);
  };

  const handleViewResults = (student: any) => {
    const testResults = student.testResults || [];
    if (testResults.length > 0) {
      toast.info(`У ${student.name} пройдено тестов: ${testResults.length}`);
    } else {
      toast.info(`${student.name} еще не проходил тесты`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Личный кабинет преподавателя</h2>
        <Button 
          onClick={handleBulkNotification}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Icon name="Bell" size={16} />
          <span>Уведомить студентов</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeacherStats stats={stats} />
        <ActiveStudentsList
          students={students}
          isLoading={isLoading}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          onViewProfile={handleViewProfile}
          onViewResults={handleViewResults}
          onAssignTask={handleAssignTask}
          onSendNotification={handleSendNotification}
          onDeleteStudent={(id) => setDeleteStudentId(id)}
        />
      </div>

      <DataExportImport
        onExportTestResults={handleExportTestResults}
        onExportStudents={handleExportStudents}
        onImportStudents={handleImportStudents}
      />

      <TopEmployees />

      <AlertDialog
        open={deleteStudentId !== null}
        onOpenChange={(open) => !open && setDeleteStudentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить студента?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Студент будет полностью удален из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStudentId && handleDeleteStudent(deleteStudentId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {notificationFormOpen && (
        <NotificationForm
          isOpen={notificationFormOpen}
          onClose={() => {
            setNotificationFormOpen(false);
            setSelectedStudentForNotification(null);
          }}
          recipientEmail={selectedStudentForNotification?.email}
          recipientName={selectedStudentForNotification?.name}
        />
      )}
    </div>
  );
};
