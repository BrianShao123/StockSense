'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/lib/firestore';
import { TransactionRow } from './transaction';
import { Timestamp } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TransactionsTable({
  transactions,
  totalTransactions
}: {
  transactions: Transaction[];
  totalTransactions: number;
}) {
  const ItemsPerPage = 5;

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      statusFilter ? transaction.operation === statusFilter : true
    );
  }, [transactions, statusFilter]);

  const sortedTransactions = useMemo(() => {
    return filteredTransactions.sort((a, b) => {
      const aTime = (a.time instanceof Timestamp ? a.time.toDate() : a.time).getTime();
      const bTime = (b.time instanceof Timestamp ? b.time.toDate() : b.time).getTime();
      return bTime - aTime;
    });
  }, [filteredTransactions]);

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * ItemsPerPage;
    const end = start + ItemsPerPage;
    return sortedTransactions.slice(start, end);
  }, [sortedTransactions, page, ItemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ItemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Recent transactions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent py-2 px-3 shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-xs"
          >
            <option value="">All</option>
            <option value="input">Input</option>
            <option value="output">Output</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        {/* <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Prev
          </Button>
          <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div> */}
      </CardFooter>
    </Card>
  );
}
