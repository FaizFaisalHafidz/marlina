import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    className?: string;
}

export function DashboardCard({ title, value, icon: Icon, className = "" }: DashboardCardProps) {
    return (
        <Card className={`${className}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );
}
