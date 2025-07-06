
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg border-2 border-background",
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </div>
  );
};
