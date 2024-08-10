import React from 'react';
interface StatusProps {
    quantity: number;
  }
  
export function Status({ quantity }: StatusProps) {
  let colorClass = '';

  if (quantity > 10) {
    colorClass = 'bg-green-500';
  } else if (quantity <= 10 && quantity >= 5) {
    colorClass = 'bg-yellow-500';
  } else {
    colorClass = 'bg-red-500';
  }

  return (
    <div className={`h-6 w-6 border border-gray-400 rounded-md ${colorClass}`}>
    </div>
  );
}
