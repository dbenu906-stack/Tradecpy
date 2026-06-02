
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, value, trend, trendUp, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border bg-card/50 backdrop-blur-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}>
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1 tabular-nums">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}
