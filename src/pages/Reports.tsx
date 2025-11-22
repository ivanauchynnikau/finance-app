import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService } from '@/services/transactionService';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

type Period = 'current-month' | 'last-month' | 'current-year' | 'all-time';

const Reports = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('current-month');

  // Вычисление дат периода
  const getPeriodDates = (period: Period) => {
    const now = new Date();
    switch (period) {
      case 'current-month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        };
      case 'current-year':
        return {
          start: format(startOfYear(now), 'yyyy-MM-dd'),
          end: format(endOfYear(now), 'yyyy-MM-dd'),
        };
      case 'all-time':
        return { start: undefined, end: undefined };
    }
  };

  const dates = getPeriodDates(period);

  // Получаем статистику
  const { data: statistics } = useQuery({
    queryKey: ['statistics', user?.id, dates.start, dates.end],
    queryFn: () => TransactionService.getStatistics(user!.id, dates.start, dates.end),
    enabled: !!user,
  });

  // Получаем транзакции за период
  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id, dates.start, dates.end],
    queryFn: () =>
      dates.start && dates.end
        ? TransactionService.getTransactionsByPeriod(user!.id, dates.start, dates.end)
        : TransactionService.getUserTransactions(user!.id),
    enabled: !!user,
  });

  // Получаем статистику по категориям
  const { data: expenseStats } = useQuery({
    queryKey: ['categoryStats', user?.id, 'expense', dates.start, dates.end],
    queryFn: () =>
      TransactionService.getCategoryStatistics(user!.id, 'expense', dates.start, dates.end),
    enabled: !!user,
  });

  const { data: incomeStats } = useQuery({
    queryKey: ['categoryStats', user?.id, 'income', dates.start, dates.end],
    queryFn: () =>
      TransactionService.getCategoryStatistics(user!.id, 'income', dates.start, dates.end),
    enabled: !!user,
  });

  // Экспорт в CSV
  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }

    const headers = ['Дата', 'Тип', 'Категория', 'Группа', 'Сумма', 'Примечание'];
    const rows = transactions.map((t) => [
      format(new Date(t.date), 'dd.MM.yyyy'),
      t.type === 'income' ? 'Доход' : 'Расход',
      t.category?.name || 'Без категории',
      t.category?.group?.name || '',
      t.amount,
      t.note || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Данные экспортированы');
  };

  // Группировка статистики по категориям
  const expenseByCategory = expenseStats?.reduce((acc, item) => {
    if (item.category) {
      const categoryId = item.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          name: item.category.name,
          icon: item.category.icon,
          total: 0,
        };
      }
      acc[categoryId].total += Number(item.amount);
    }
    return acc;
  }, {} as Record<string, { name: string; icon: string; total: number }>);

  const incomeByCategory = incomeStats?.reduce((acc, item) => {
    if (item.category) {
      const categoryId = item.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          name: item.category.name,
          icon: item.category.icon,
          total: 0,
        };
      }
      acc[categoryId].total += Number(item.amount);
    }
    return acc;
  }, {} as Record<string, { name: string; icon: string; total: number }>);

  const expenseCategoryList = Object.values(expenseByCategory || {}).sort(
    (a, b) => b.total - a.total
  );
  const incomeCategoryList = Object.values(incomeByCategory || {}).sort((a, b) => b.total - a.total);

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Отчеты</h1>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>

        {/* Выбор периода */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Период</label>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Текущий месяц</SelectItem>
              <SelectItem value="last-month">Прошлый месяц</SelectItem>
              <SelectItem value="current-year">Текущий год</SelectItem>
              <SelectItem value="all-time">Все время</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Общая статистика */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Общая статистика</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Доходы:</span>
              <span className="text-xl font-bold text-green-500">
                ₽{statistics?.income.toLocaleString('ru-RU') || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Расходы:</span>
              <span className="text-xl font-bold text-red-500">
                ₽{statistics?.expense.toLocaleString('ru-RU') || 0}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-semibold">Остаток:</span>
              <span className="text-2xl font-bold">
                ₽{statistics?.balance.toLocaleString('ru-RU') || 0}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Транзакций:</span>
              <span className="font-semibold">{transactions?.length || 0}</span>
            </div>
          </div>
        </Card>

        {/* Расходы по категориям */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Расходы по категориям</h3>
          {expenseCategoryList.length > 0 ? (
            <div className="space-y-3">
              {expenseCategoryList.map((cat, index) => {
                const percentage =
                  statistics?.expense > 0
                    ? ((cat.total / statistics.expense) * 100).toFixed(0)
                    : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm">{percentage}%</span>
                      <span className="font-semibold">₽{cat.total.toLocaleString('ru-RU')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Нет данных</p>
          )}
        </Card>

        {/* Доходы по категориям */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Доходы по категориям</h3>
          {incomeCategoryList.length > 0 ? (
            <div className="space-y-3">
              {incomeCategoryList.map((cat, index) => {
                const percentage =
                  statistics?.income > 0 ? ((cat.total / statistics.income) * 100).toFixed(0) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm">{percentage}%</span>
                      <span className="font-semibold">₽{cat.total.toLocaleString('ru-RU')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Нет данных</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

