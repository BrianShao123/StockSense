'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TransactionsTable } from '../transactions-table';
import { getTransactions } from '@/lib/db';
import { Transaction } from '@/lib/firestore';
import { useAuth } from '@/components/context/AuthContext';
import { SearchInput } from '../search';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Spinner } from '@/components/icons'
import exportToExcel from '@/lib/export';

export default function History({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const initialSearch = searchParams.q ?? '';
  const initialOffset = searchParams.offset ?? 0;
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentTab, setCurrentTab] = useState('all');
  const [search, setSearch] = useState(initialSearch);
  const [offset, setOffset] = useState<number>(initialOffset ? parseInt(initialOffset, 10) : 0);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const ItemsPerPage = 5;

  const fetchTransactions = async () => {
    if (!user || !user.uid) return;
    const { transactions, newOffset, totalTransactions } = await getTransactions(user.uid, search, lastDoc, ItemsPerPage);
    setTransactions(transactions);
    setLastDoc(newOffset);
    setTotalTransactions(totalTransactions);
  };

  const handleExport = () => {
    const fieldsToExport = ['name', 'quantity', 'operation', 'status', 'time', 'price'];
    exportToExcel(transactions, fieldsToExport, "Transactions", "transactions.xlsx");
  };

  useEffect(() => {
    if (user && user.uid) {
      fetchTransactions();
    }
  }, [user, search, offset]);

  const filteredTransactions = (filter: string) => {
    let filtered = transactions;
    if (search) {
      filtered = filtered.filter(transaction => transaction.name.toLowerCase().includes(search.toLowerCase()));
    }
    return filtered;
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(offset - ItemsPerPage);
      setLastDoc(null);
    }
  };

  const handleNextPage = () => {
    if (transactions.length === ItemsPerPage) {
      setOffset(offset + ItemsPerPage);
    }
  };

  if (loading) {
    return <div>
      <Spinner />
    </div>;
  }

  if (!user) {
    return <div>Please log in to view transactions.</div>;
  }

  return (
    <Tabs defaultValue="all" onValueChange={(value) => setCurrentTab(value)}>
      <div className="flex items-center justify-between">
        <TabsList className="flex items-center">
        </TabsList>
        <div className="flex items-center gap-2">
          {/* <SearchInput onSearch={setSearch} /> */}
          <Button size="sm" className="h-8 gap-1" onClick={handleExport}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <div className="flex">
          <div className="w-full">
            <TransactionsTable transactions={filteredTransactions(currentTab)} totalTransactions={totalTransactions} />
          </div>
        </div>
      </TabsContent>
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-muted-foreground">
          Showing page <strong>{Math.floor(offset / ItemsPerPage) + 1}</strong>
        </div>
        <div className="flex">
          <Button onClick={handlePrevPage} variant="ghost" size="sm" disabled={offset === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Prev
          </Button>
          <Button onClick={handleNextPage} variant="ghost" size="sm" disabled={transactions.length < ItemsPerPage}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Tabs>
  );
}
