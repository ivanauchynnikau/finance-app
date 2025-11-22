import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryService } from '@/services/categoryService';
import { TransactionService } from '@/services/transactionService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'income' | 'expense';
}

export const AddTransactionDialog = ({ open, onOpenChange, defaultType = 'expense' }: AddTransactionDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  
  // Устанавливаем тип при открытии диалога
  useEffect(() => {
    if (open) {
      setType(defaultType);
    }
  }, [open, defaultType]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Получаем категории по типу
  const { data: categories } = useQuery({
    queryKey: ['categories', user?.id, type],
    queryFn: () => CategoryService.getCategoriesByType(user!.id, type),
    enabled: !!user && open,
  });

  // Мутация создания транзакции
  const createMutation = useMutation({
    mutationFn: TransactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
      toast.success('Транзакция добавлена');
      handleClose();
    },
    onError: () => {
      toast.error('Ошибка при добавлении транзакции');
    },
  });

  const handleSubmit = () => {
    if (!amount || !categoryId || !user) return;

    createMutation.mutate({
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      date: format(date, 'yyyy-MM-dd'),
      category_id: categoryId,
      note: note || undefined,
    });
  };

  const handleClose = () => {
    setAmount('');
    setCategoryId('');
    setNote('');
    setCategorySearch('');
    setDate(new Date());
    onOpenChange(false);
  };

  // Фильтрация категорий по поиску
  const filteredCategories = categories?.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая операция</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Переключатель доход/расход */}
          <Tabs value={type} onValueChange={(v) => {
            setType(v as 'income' | 'expense');
            setCategoryId('');
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Расход</TabsTrigger>
              <TabsTrigger value="income">Доход</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Сумма */}
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-mono"
            />
          </div>

          {/* Дата */}
          <div className="space-y-2">
            <Label>Дата</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: ru }) : 'Выберите дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Категория */}
          <div className="space-y-2">
            <Label>Выберите категорию</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Поиск категории..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 mb-2"
              />
            </div>

            {/* Список категорий */}
            <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryId(category.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      categoryId === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                      {category.group && (
                        <p className="text-xs opacity-80">{category.group.name}</p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">Категории не найдены</p>
                  <p className="text-sm">Создайте категории в разделе "Категории"</p>
                </div>
              )}
            </div>
          </div>

          {/* Примечание */}
          <div className="space-y-2">
            <Label htmlFor="note">Примечание (опционально)</Label>
            <Textarea
              id="note"
              placeholder="Добавьте заметку..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!amount || !categoryId || createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

