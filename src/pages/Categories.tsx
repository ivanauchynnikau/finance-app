import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { GroupService } from '@/services/groupService';
import { CategoryService } from '@/services/categoryService';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { AddCategoryDialog } from '@/components/AddCategoryDialog';
import { AddGroupDialog } from '@/components/AddGroupDialog';

const Categories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  // Получаем группы и категории
  const { data: groups } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: () => GroupService.getUserGroups(user!.id),
    enabled: !!user,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => CategoryService.getUserCategories(user!.id),
    enabled: !!user,
  });

  // Мутация удаления группы
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => GroupService.deleteGroup(user!.id, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Группа удалена');
      setDeleteGroupId(null);
    },
    onError: () => {
      toast.error('Ошибка при удалении группы');
    },
  });

  // Мутация удаления категории
  const deleteCategoryMutation = useMutation({
    mutationFn: CategoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении категории');
    },
  });

  // Группировка категорий по группам
  const categoriesByGroup = categories?.reduce((acc, cat) => {
    const groupId = cat.group_id || 'no-group';
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(cat);
    return acc;
  }, {} as Record<string, typeof categories>);

  // Фильтрация по поиску
  const filteredGroups = groups?.filter(group => {
    const groupMatches = group.name.toLowerCase().includes(search.toLowerCase());
    const groupCategories = categoriesByGroup?.[group.id] || [];
    const hasMatchingCategory = groupCategories.some(cat =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
    return groupMatches || hasMatchingCategory;
  });

  const toggleAll = (expand: boolean) => {
    if (expand) {
      setExpandedGroups(groups?.map(g => g.id) || []);
    } else {
      setExpandedGroups([]);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Категории</h1>
          <Button onClick={() => setShowAddGroup(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Группа
          </Button>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск категорий..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Кнопки развернуть/свернуть */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
            <ChevronDown className="h-4 w-4 mr-2" />
            Развернуть все
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
            <ChevronUp className="h-4 w-4 mr-2" />
            Свернуть все
          </Button>
        </div>

        {/* Аккордеон с группами */}
        <Accordion
          type="multiple"
          value={expandedGroups}
          onValueChange={setExpandedGroups}
        >
          {filteredGroups?.map((group) => {
            const groupCategories = categoriesByGroup?.[group.id] || [];
            const filteredCategories = search
              ? groupCategories.filter(cat =>
                  cat.name.toLowerCase().includes(search.toLowerCase())
                )
              : groupCategories;

            return (
              <AccordionItem key={group.id} value={group.id}>
                <Card className="mb-2">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{group.icon}</span>
                      <div className="text-left flex-1">
                        <span className="font-semibold">{group.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({filteredCategories.length})
                        </span>
                      </div>
                      {!group.is_default && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteGroupId(group.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{category.icon}</span>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {category.type === 'income' ? 'Доход' : 'Расход'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCategory(true)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить категорию
                      </Button>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Кнопка добавления группы */}
        <Button onClick={() => setShowAddGroup(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Добавить группу
        </Button>
      </div>

      {/* Диалоги */}
      <AddCategoryDialog
        open={showAddCategory}
        onOpenChange={setShowAddCategory}
        groups={groups || []}
      />
      <AddGroupDialog open={showAddGroup} onOpenChange={setShowAddGroup} />

      {/* Диалог подтверждения удаления группы */}
      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить группу?</AlertDialogTitle>
            <AlertDialogDescription>
              Все категории из этой группы будут перемещены в группу "Общие".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroupId && deleteGroupMutation.mutate(deleteGroupId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Categories;

