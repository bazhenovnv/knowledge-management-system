import { useState, useEffect } from 'react';

const DEFAULT_DEPARTMENTS = [
  "1С",
  "Партнерка",
  "ЦТО",
  "Сервис",
  "Крупные клиенты",
  "Отдел заявок",
  "Отдел сопровождения",
  "HoReCa",
  "Отдел Тинькофф",
  "Отдел ФН",
  "Логистика",
  "Тех. поддержка",
  "Отдел маркетинга",
  "Отдел маркетплейсы"
];

const DEFAULT_POSITIONS = [
  "Разработчик",
  "Системный администратор",
  "Аналитик",
  "Менеджер",
  "Специалист",
  "Консультант",
  "Инженер",
  "Бухгалтер",
  "HR-специалист",
  "Маркетолог",
  "Менеджер по продажам",
  "Логист",
  "Охранник",
  "Юрист",
  "Директор",
  "Заместитель директора",
  "Руководитель отдела"
];

export const useDepartments = () => {
  const [departments, setDepartments] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_departments');
    return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
  });

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      setDepartments(e.detail);
    };

    window.addEventListener('departmentsUpdated', handleUpdate as EventListener);
    return () => window.removeEventListener('departmentsUpdated', handleUpdate as EventListener);
  }, []);

  return departments;
};

export const usePositions = () => {
  const [positions, setPositions] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_positions');
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS;
  });

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      setPositions(e.detail);
    };

    window.addEventListener('positionsUpdated', handleUpdate as EventListener);
    return () => window.removeEventListener('positionsUpdated', handleUpdate as EventListener);
  }, []);

  return positions;
};
