import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export const ChartCard = ({ 
  title, 
  children, 
  className, 
  description 
}: ChartCardProps) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}; 