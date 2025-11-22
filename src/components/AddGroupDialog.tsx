import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { GroupService } from '@/services/groupService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMOJI_ICONS = [
  '📁', '🏠', '🚗', '💰', '📈', '🎯', '🛒', '🎬', '📚', '✈️',
  '🏋️', '💊', '👕', '🎁', '💻', '📱', '🍔', '☕', '🎮', '🏦',
];

const COLORS = [
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Фиолетовый', value: '#6366f1' },
  { name: 'Розовый', value: '#ec4899' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Оранжевый', value: '#f97316' },
  { name: 'Желтый', value: '#eab308' },
  { name: 'Зеленый', value: '#22c55e' },
  { name: 'Изумрудный', value: '#10b981' },
  { name: 'Циан', value: '#06b6d4' },
  { name: 'Серый', value: '#6b7280' },
];

export const AddGroupDialog = ({ open, onOpenChange }: AddGroupDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#6366f1');

  const createMutation = useMutation({
    mutationFn: GroupService.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Группа добавлена');
      handleClose();
    },
    onError: () => {
      toast.error('Ошибка при добавлении группы');
    },
  });

  const handleSubmit = () => {
    if (!name || !user) return;

    createMutation.mutate({
      user_id: user.id,
      name,
      icon,
      color,
      is_default: false,
    });
  };

  const handleClose = () => {
    setName('');
    setIcon('📁');
    setColor('#6366f1');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая группа</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              placeholder="Например: На жизнь"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Иконка */}
          <div className="space-y-2">
            <Label>Иконка</Label>
            <div className="grid grid-cols-10 gap-2 p-2 border rounded-lg">
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

          {/* Цвет */}
          <div className="space-y-2">
            <Label>Цвет</Label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`h-10 rounded-lg transition-all ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
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
              disabled={!name || createMutation.isPending}
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

