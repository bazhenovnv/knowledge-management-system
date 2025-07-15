export const getStatusColor = (status: number): string => {
  switch (status) {
    case 1:
    case 2:
      return "bg-red-500";
    case 3:
      return "bg-yellow-500";
    case 4:
    case 5:
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export const getStatusText = (status: number): string => {
  return status.toString();
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