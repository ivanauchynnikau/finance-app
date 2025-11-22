import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryService } from '@/services/categoryService';
import { Group } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Group[];
}

const EMOJI_ICONS = [
  '💰', '🍎', '🍕', '☕', '🚗', '⛽', '🚇', '🚕', '🏠', '⚡',
  '💊', '👕', '🎁', '🎬', '📚', '✈️', '🏋️', '🎮', '📱', '💻',
  '💵', '💼', '📈', '🏦', '💳', '🎯', '🛒', '🍔', '🌮', '🍺',
];

export const AddCategoryDialog = ({ open, onOpenChange, groups }: AddCategoryDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [groupId, setGroupId] = useState('');

  const createMutation = useMutation({
    mutationFn: CategoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория добавлена');
      handleClose();
    },
    onError: () => {
      toast.error('Ошибка при добавлении категории');
    },
  });

  const handleSubmit = () => {
    if (!name || !groupId || !user) return;

    createMutation.mutate({
      user_id: user.id,
      name,
      icon,
      type,
      group_id: groupId,
    });
  };

  const handleClose = () => {
    setName('');
    setIcon('💰');
    setType('expense');
    setGroupId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая категория</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Тип */}
          <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Расход</TabsTrigger>
              <TabsTrigger value="income">Доход</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              placeholder="Например: Продукты"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Группа */}
          <div className="space-y-2">
            <Label htmlFor="group">Группа</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Выберите группу" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.icon} {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Иконка */}
          <div className="space-y-2">
            <Label>Иконка</Label>
            <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {EMOJI_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded hover:bg-accent transition-colors ${
                    icon === emoji ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name || !groupId || createMutation.isPending}
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

