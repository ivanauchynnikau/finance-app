import { TransactionWithCategory } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: TransactionWithCategory[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Нет транзакций</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{transaction.category?.icon || '💰'}</div>
              <div>
                <p className="font-medium">{transaction.category?.name || 'Без категории'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), 'd MMMM', { locale: ru })}
                </p>
                {transaction.note && (
                  <p className="text-sm text-muted-foreground mt-1">{transaction.note}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'text-lg font-bold',
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {Number(transaction.amount).toLocaleString('ru-RU')} р.
              </p>
              {transaction.category?.group && (
                <p className="text-xs text-muted-foreground">
                  {transaction.category.group.name}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

