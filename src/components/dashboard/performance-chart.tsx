
"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Jan", master: 10000, follower: 5000 },
  { month: "Feb", master: 10500, follower: 5250 },
  { month: "Mar", master: 11200, follower: 5600 },
  { month: "Apr", master: 10800, follower: 5400 },
  { month: "May", master: 11500, follower: 5750 },
  { month: "Jun", master: 12100, follower: 6050 },
]

const chartConfig = {
  master: {
    label: "Master Account",
    color: "hsl(var(--primary))",
  },
  follower: {
    label: "Follower Account",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export function PerformanceChart() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <AreaChart
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <defs>
            <linearGradient id="fillMaster" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-master)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-master)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="fillFollower" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-follower)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-follower)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            dataKey="master"
            type="monotone"
            fill="url(#fillMaster)"
            stroke="var(--color-master)"
            strokeWidth={2}
            stackId="a"
          />
          <Area
            dataKey="follower"
            type="monotone"
            fill="url(#fillFollower)"
            stroke="var(--color-follower)"
            strokeWidth={2}
            stackId="b"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
