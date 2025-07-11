export const getStatusColor = (status: string): string => {
  switch (status) {
    case "green":
      return "bg-green-500";
    case "yellow":
      return "bg-yellow-500";
    case "red":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case "green":
      return "Отлично";
    case "yellow":
      return "Хорошо";
    case "red":
      return "Требует внимания";
    default:
      return "Неизвестно";
  }
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "Начинающий":
      return "bg-green-100 text-green-800";
    case "Средний":
      return "bg-yellow-100 text-yellow-800";
    case "Продвинутый":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
