'use client';

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { getItems } from '@/lib/db';
import { useAuth } from '@/components/context/AuthContext';
import { Item } from '@/lib/firestore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Spinner } from '../icons';
import { Card } from '@/components/ui/card';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ size = 200 }: { size?: number }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = async () => {
    if (!user || !user.uid) return;
    const { items, totalItems } = await getItems(user.uid, '', null, 100);
    setItems(items);
    setTotalItems(totalItems);
  };

  useEffect(() => {
    if (user && user.uid) {
      fetchItems();
    }
  }, [user]);

  const getChartData = () => {
    const sortedItems = [...items].sort((a, b) => b.quantity - a.quantity);
    const topItems = sortedItems.slice(0, 4);
    const otherCount = sortedItems.slice(4).reduce((sum, item) => sum + item.quantity, 0);

    const labels = topItems.map(item => item.name).concat('Other');
    const data = topItems.map(item => item.quantity).concat(otherCount);
    const totalCount = data.reduce((sum, count) => sum + count, 0);

    return {
      labels,
      datasets: [
        {
          label: 'Item Count',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'pie'>) => {
            const value = tooltipItem.raw as number;
            const totalCount = (tooltipItem.dataset.data as number[]).reduce((sum, count) => sum + count, 0);
            const percentage = ((value / totalCount) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <div>Please log in to view items.</div>;
  }

  return (
      <Card className="flex flex-col items-center w-full py-2">
        <div className="mt-4 text-lg font-semibold">
          Distribution of All Items
        </div>
        <div className="w-full max-w-xs md:max-w-sm lg:max-w-md" style={{ aspectRatio: '1 / 1' }}>
          <Pie data={getChartData()} options={options} />
        </div>
      </Card>
  );
}
