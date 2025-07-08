"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PieChartProps {
  title: string
  description?: string
  data: {
    name: string
    value: number
  }[]
  colors?: string[]
  className?: string
}

export function PieChartComponent({
  title,
  description,
  data,
  colors = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--accent))"],
  className,
}: PieChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
              formatter={(value) => [`${value}`, "Value"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-xs">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

