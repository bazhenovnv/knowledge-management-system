import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge = ({
  count,
  className = "",
}: NotificationBadgeProps) => {
  if (count === 0) return null;

  return (
    <Badge
      variant="secondary"
      className={`bg-blue-100 text-blue-800 hover:bg-blue-200 ${className}`}
    >
      {count > 9 ? "9+" : count} новых уведомлений
    </Badge>
  );
};
