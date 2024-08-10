'use client';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemsTable } from './items-table';
import { getItems, listenToItems } from '@/lib/db';
import { Item } from '@/lib/firestore';
import { InputForm } from '@/components/ui/pantry-form';
import { SearchInput } from './search';
import { useAuth } from '@/components/context/AuthContext';
import exportToExcel from '@/lib/export';
import { Spinner } from '@/components/icons';
export default function ItemsPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const initialSearch = searchParams.q ?? '';
  const initialOffset = searchParams.offset ?? 0;
  const [items, setItems] = useState<Item[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentTab, setCurrentTab] = useState('all');
  const [search, setSearch] = useState(initialSearch);
  const { user, loading } = useAuth();

  const fetchItems = async () => {
    if (!user || !user.uid) return;
    const { items, totalItems } = await getItems(user.uid, search, initialOffset, 5); // Include pageSize if not default
    setItems(items);
    setTotalItems(totalItems);
  };

  useEffect(() => {
    if (user && user.uid) {
      fetchItems();
      const unsubscribe = listenToItems(user.uid, (newItems) => {
        setItems(newItems);
      });
      return () => unsubscribe();
    }
  }, [user, search, initialOffset]);

  const filteredItems = (filter: string) => {
    let filtered = items;
    if (filter === 'in stock') {
      filtered = items.filter(item => item.quantity > 0);
    } else if (filter === 'out of stock') {
      filtered = items.filter(item => item.quantity <= 0);
    }
    if (search) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    return filtered;
  };

  const handleExport = () => {
    const fieldsToExport = ['name', 'price', 'quantity', 'last operation', 'last update'];
    exportToExcel(items, fieldsToExport, "Items", "items.xlsx");
  };

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <div>Please log in to view items.</div>;
  }

  return (
    <Tabs defaultValue="all" onValueChange={(value) => setCurrentTab(value)}>
      <div className="flex items-center justify-between">
        <TabsList className="flex items-center">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in stock">In Stock</TabsTrigger>
          <TabsTrigger value="out of stock">Out of Stock</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <SearchInput onSearch={setSearch} />
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={fetchItems}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Refresh
            </span>
          </Button>
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
          <div className="w-3/4">
            <ItemsTable items={filteredItems(currentTab)} totalItems={totalItems} />
          </div>
          <div className="w-1/4 ml-2">
            <InputForm />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="in stock">
        <div className="flex">
          <div className="w-3/4">
            <ItemsTable items={filteredItems(currentTab)} totalItems={totalItems} />
          </div>
          <div className="w-1/4 ml-2">
            <InputForm />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="out of stock">
        <div className="flex">
          <div className="w-3/4">
            <ItemsTable items={filteredItems(currentTab)} totalItems={totalItems} />
          </div>
          <div className="w-1/4 ml-2">
            <InputForm />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
