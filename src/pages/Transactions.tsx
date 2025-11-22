import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService } from '@/services/transactionService';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { Plus, Minus, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FilterType = 'all' | 'income' | 'expense';

const Transactions = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [defaultType, setDefaultType] = useState<'income' | 'expense'>('expense');

  // Получаем все транзакции
  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => TransactionService.getUserTransactions(user!.id),
    enabled: !!user,
  });

  // Фильтрация транзакций
  const filteredTransactions = transactions?.filter((transaction) => {
    // Фильтр по типу
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }

    // Фильтр по поиску
    if (search) {
      const searchLower = search.toLowerCase();
      const categoryName = transaction.category?.name.toLowerCase() || '';
      const note = transaction.note?.toLowerCase() || '';
      const amount = transaction.amount.toString();

      return (
        categoryName.includes(searchLower) ||
        note.includes(searchLower) ||
        amount.includes(searchLower)
      );
    }

    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Операции</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setDefaultType('expense');
                setShowAddDialog(true);
              }} 
              size="icon"
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Button 
              onClick={() => {
                setDefaultType('income');
                setShowAddDialog(true);
              }} 
              size="icon"
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск операций..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Фильтр по типу */}
        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="expense">Расходы</TabsTrigger>
            <TabsTrigger value="income">Доходы</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Список транзакций */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Найдено: {filteredTransactions?.length || 0}
          </p>
          <TransactionList transactions={filteredTransactions || []} />
        </div>
      </div>

      <AddTransactionDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        defaultType={defaultType}
      />
    </Layout>
  );
};

export default Transactions;

