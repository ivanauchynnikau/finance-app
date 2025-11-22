import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService } from '@/services/transactionService';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Minus } from 'lucide-react';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { TransactionList } from '@/components/TransactionList';

type ViewMode = 'groups' | 'categories';

const Dashboard = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('groups');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [defaultType, setDefaultType] = useState<'income' | 'expense'>('expense');
  
  const currentDate = new Date();
  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  // Получаем статистику
  const { data: statistics } = useQuery({
    queryKey: ['statistics', user?.id, startDate, endDate],
    queryFn: () => TransactionService.getStatistics(user!.id, startDate, endDate),
    enabled: !!user,
  });

  // Получаем транзакции за текущий месяц
  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id, startDate, endDate],
    queryFn: () => TransactionService.getTransactionsByPeriod(user!.id, startDate, endDate),
    enabled: !!user,
  });

  // Получаем статистику по категориям для расходов
  const { data: categoryStats } = useQuery({
    queryKey: ['categoryStats', user?.id, 'expense', startDate, endDate],
    queryFn: () => TransactionService.getCategoryStatistics(user!.id, 'expense', startDate, endDate),
    enabled: !!user,
  });

  // Пастельные цвета для диаграммы
  const PASTEL_COLORS = [
    '#a7f3d0', // Мятный
    '#fde68a', // Желтый
    '#fecaca', // Розовый
    '#c4b5fd', // Фиолетовый
    '#bfdbfe', // Голубой
    '#fbcfe8', // Лиловый
    '#99f6e4', // Бирюзовый
    '#fed7aa', // Персиковый
    '#d9f99d', // Лаймовый
    '#ddd6fe', // Лавандовый
  ];

  // Подготовка данных для диаграммы
  const chartData = categoryStats
    ? viewMode === 'groups'
      ? prepareGroupData(categoryStats).map((item, idx) => ({
          ...item,
          color: PASTEL_COLORS[idx % PASTEL_COLORS.length]
        }))
      : prepareCategoryData(categoryStats).map((item, idx) => ({
          ...item,
          color: PASTEL_COLORS[idx % PASTEL_COLORS.length]
        }))
    : [];

  const totalExpense = statistics?.expense || 0;

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Money</h1>
            <p className="text-muted-foreground mt-1">
              {format(currentDate, 'LLLL yyyy', { locale: ru })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setDefaultType('expense');
                setShowAddDialog(true);
              }} 
              size="icon" 
              className="rounded-full h-12 w-12 bg-red-400 hover:bg-red-500 text-white"
            >
              <Minus className="h-6 w-6" />
            </Button>
            <Button 
              onClick={() => {
                setDefaultType('income');
                setShowAddDialog(true);
              }} 
              size="icon" 
              className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Круговая диаграмма */}
        {chartData.length > 0 && totalExpense > 0 && (
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Финансовая сводка */}
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Доходы:</span>
              <span className="text-xl font-bold text-green-500">
                {statistics?.income.toLocaleString('ru-RU') || 0} р.
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Расходы:</span>
              <span className="text-xl font-bold text-red-500">
                {statistics?.expense.toLocaleString('ru-RU') || 0} р.
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-semibold">Остаток:</span>
              <span className="text-2xl font-bold">
                {statistics?.balance.toLocaleString('ru-RU') || 0} р.
              </span>
            </div>
          </div>
        </Card>

        {/* Переключение группы/категории */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">Группы</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Легенда */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Распределение расходов</h3>
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{percentage}%</span>
                    <span className="font-semibold">{item.value.toLocaleString('ru-RU')} р.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Последние транзакции */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Последние операции</h3>
          <TransactionList transactions={transactions?.slice(0, 10) || []} />
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

// Подготовка данных по группам
function prepareGroupData(stats: any[]) {
  const groupMap = new Map<string, { name: string; icon: string; color: string; value: number }>();

  stats.forEach((item) => {
    if (item.category?.group) {
      const group = item.category.group;
      const existing = groupMap.get(group.id);
      const amount = Number(item.amount);

      if (existing) {
        existing.value += amount;
      } else {
        groupMap.set(group.id, {
          name: group.name,
          icon: group.icon,
          color: group.color,
          value: amount,
        });
      }
    }
  });

  return Array.from(groupMap.values()).sort((a, b) => b.value - a.value);
}

// Подготовка данных по категориям
function prepareCategoryData(stats: any[]) {
  const categoryMap = new Map<string, { name: string; icon: string; color: string; value: number }>();

  stats.forEach((item) => {
    if (item.category) {
      const category = item.category;
      const existing = categoryMap.get(category.id);
      const amount = Number(item.amount);
      const color = category.group?.color || '#6366f1';

      if (existing) {
        existing.value += amount;
      } else {
        categoryMap.set(category.id, {
          name: category.name,
          icon: category.icon,
          color,
          value: amount,
        });
      }
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
}

export default Dashboard;

