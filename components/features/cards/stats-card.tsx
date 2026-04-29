import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  onClick?: () => void;
  trend?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'default';
  loading?: boolean;
};

export const StatsCard = ({
  title,
  value,
  icon,
  description,
  onClick,
  trend,
  variant = 'default',
  loading = false,
}: StatsCardProps) => {
  const variantClasses = {
    primary: 'border-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:border-blue-700',
    secondary: 'border-purple-500 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:border-purple-700',
    success: 'border-green-500 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:border-green-700',
    destructive: 'border-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:border-red-700',
    default: 'hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-700',
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200 cursor-pointer',
        variantClasses[variant],
        onClick && 'hover:shadow-md dark:hover:shadow-md dark:hover:shadow-gray-800/30'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </CardTitle>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center text-gray-900 dark:text-gray-100">
          {value}
          {trend !== undefined && (
            <span className={cn(
              "text-xs ml-2 flex items-center",
              trend >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
            )}>
              {trend >= 0 ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};