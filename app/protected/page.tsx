"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { Progress } from "@/components/ui/progress";

async function fetchProtectedData(token: string) {
  const response = await fetch('/api/protected', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch protected data');
  }

  return response.json();
}

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      const getData = async () => {
        try {
          const token = await user.getIdToken();
          const protectedData = await fetchProtectedData(token);
          setData(protectedData);
        } catch (error) {
          console.error('Error fetching protected data:', error);
        }
      };

      getData();
    }
  }, [user]);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(33), 500);
    const timer2 = setTimeout(() => setProgress(66), 1000);
    const timer3 = setTimeout(() => setProgress(100), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      router.push('/');
    }
  }, [progress, router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="mb-4">Testing some things out...</h1>
      <Progress value={progress} className="w-[60%]" />
    </div>
  );
}
