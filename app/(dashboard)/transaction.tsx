'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Transaction } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    return (amount / 1000).toFixed(1) + 'k';
  }
  return amount.toString();
}

function formatDate(time: any): string {
  if (time instanceof Date) {
    return time.toLocaleString();
  } else if (time instanceof Timestamp) {
    return time.toDate().toLocaleString() + " EDT";
  } else {
    return 'Invalid Date';
  }
}

function calculateProfit(transaction: Transaction): string {
  if (transaction.operation === 'input') {
    return `- $${(transaction.price * 0.1 * transaction.quantity).toFixed(2)}`;
  }
  return `$${(transaction.price * 0.9 * transaction.quantity).toFixed(2)}`;
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{transaction.name}</TableCell>
      <TableCell>{formatAmount(transaction.quantity)}</TableCell>
      <TableCell>{transaction.operation}</TableCell>
      <TableCell>{transaction.status}</TableCell>
      <TableCell>{formatDate(transaction.time)}</TableCell>
      <TableCell>{calculateProfit(transaction)}</TableCell>
    </TableRow>
  );
}
