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
import { ItemRow } from './item';
import { Item } from '@/lib/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';

export function ItemsTable({
  items,
  totalItems
}: {
  items: Item[];
  totalItems: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ItemsPerPage = 5;

  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  function prevPage() {
    const newPage = Math.max(1, page - 1);
    setPage(newPage);
    router.push(`/?page=${newPage}`, { scroll: false });
  }

  function nextPage() {
    const newPage = page + 1;
    setPage(newPage);
    router.push(`/?page=${newPage}`, { scroll: false });
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      statusFilter ? item.operation === statusFilter : true
    );
  }, [items, statusFilter]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ItemsPerPage;
    const end = start + ItemsPerPage;
    return filteredItems.slice(start, end);
  }, [filteredItems, page, ItemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / ItemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
        <CardDescription>
          Manage your Items and view their availability.
        </CardDescription>
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
              <TableHead> Status </TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Price ($)</TableHead>
              <TableHead className="hidden md:table-cell">
                Quantity
              </TableHead>
              <TableHead className="hidden md:table-cell">Last Operation</TableHead>
              <TableHead className="hidden md:table-cell">Last Update</TableHead>
              <TableHead className="hidden md:table-cell">Potential Profit</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="flex">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              disabled={page === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
