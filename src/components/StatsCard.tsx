import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "warning" | "success" | "destructive" | "info";
  description?: string;
  onClick?: () => void;
  "data-testid"?: string;
}

export const StatsCard = ({ title, value, icon: Icon, variant = "default", description, onClick, "data-testid": dataTestId }: StatsCardProps) => {
  const variantStyles = {
    default: "text-primary",
    warning: "text-warning",
    success: "text-success",
    destructive: "text-destructive",
    info: "text-orange-600 dark:text-orange-400",
  };

  return (
    <Card 
      className={`transition-all hover:shadow-lg ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${variantStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};
