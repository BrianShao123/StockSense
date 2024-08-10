"use client"

import React, { useState, useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from '@/components/context/AuthContext';
import { Transaction } from "@/lib/firestore";
import { getAllTransactions } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';

const chartConfig = {
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ProfitData {
  date: string;
  profit: number;
}

export function LineComponent() {
  const [chartData, setChartData] = useState<ProfitData[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.uid) return;
      const { transactions } = await getAllTransactions(user.uid);
      
      const profitData = calculateDailyProfit(transactions);
      setChartData(profitData);
    };
    fetchData();
  }, [user]);

  const calculateDailyProfit = (transactions: Transaction[]): ProfitData[] => {
    const profitMap: { [key: string]: number } = {};
    transactions.forEach((transaction) => {
      const transactionDate = transaction.time instanceof Timestamp ? transaction.time.toDate() : transaction.time;
      const date = transactionDate.toLocaleDateString();
      const profit = transaction.operation === "input" ? -transaction.price * 0.1 * transaction.quantity : transaction.price * 0.9 * transaction.quantity;

      if (profitMap[date]) {
        profitMap[date] += profit;
      } else {
        profitMap[date] = profit;
      }
    });

    const today = new Date();
    const profitData: ProfitData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString();
      profitData.unshift({
        date: dateString,
        profit: profitMap[dateString] || 0,
      });
    }

    return profitData;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Chart</CardTitle>
        <CardDescription>Profit over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
            width={600}
            height={400}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Legend />
            <Line
              dataKey="profit"
              type="linear"
              stroke={chartConfig.profit.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
