-- Шаг 1: Создаем функцию для автоматического создания категорий
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Создаем группы
  INSERT INTO public.groups (user_id, name, icon, color, is_default) VALUES
    (NEW.id, 'Общие', '📁', '#6366f1', true);
  
  INSERT INTO public.groups (user_id, name, icon, color) VALUES
    (NEW.id, 'На жизнь', '🏠', '#10b981');
  
  INSERT INTO public.groups (user_id, name, icon, color) VALUES
    (NEW.id, 'Транспорт', '🚗', '#f59e0b');
  
  INSERT INTO public.groups (user_id, name, icon, color) VALUES
    (NEW.id, 'Доходы', '💰', '#22c55e');

  -- Создаем категории расходов
  INSERT INTO public.categories (user_id, group_id, name, icon, type)
  SELECT 
    NEW.id,
    g.id,
    cat.name,
    cat.icon,
    cat.type
  FROM public.groups g
  CROSS JOIN (
    VALUES 
      ('Продукты', '🍎', 'expense', 'На жизнь'),
      ('Кафе и рестораны', '🍕', 'expense', 'На жизнь'),
      ('Коммуналка', '⚡', 'expense', 'На жизнь'),
      ('Транспорт', '🚇', 'expense', 'Транспорт'),
      ('Такси', '🚕', 'expense', 'Транспорт'),
      ('Бензин', '⛽', 'expense', 'Транспорт'),
      ('Развлечения', '🎬', 'expense', 'Общие'),
      ('Здоровье', '💊', 'expense', 'Общие'),
      ('Одежда', '👕', 'expense', 'Общие'),
      ('Подарки', '🎁', 'expense', 'Общие'),
      ('Зарплата', '💵', 'income', 'Доходы'),
      ('Подработка', '💼', 'income', 'Доходы'),
      ('Инвестиции', '📈', 'income', 'Доходы')
  ) AS cat(name, icon, type, group_name)
  WHERE g.user_id = NEW.id AND g.name = cat.group_name;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Шаг 2: Создаем триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Шаг 3: Для СУЩЕСТВУЮЩИХ пользователей (выполните если нужно)
INSERT INTO public.groups (user_id, name, icon, color, is_default)
SELECT id, 'Общие', '📁', '#6366f1', true
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE groups.user_id = auth.users.id);

INSERT INTO public.groups (user_id, name, icon, color)
SELECT id, 'На жизнь', '🏠', '#10b981'
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE groups.user_id = auth.users.id AND groups.name = 'На жизнь');

INSERT INTO public.groups (user_id, name, icon, color)
SELECT id, 'Транспорт', '🚗', '#f59e0b'
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE groups.user_id = auth.users.id AND groups.name = 'Транспорт');

INSERT INTO public.groups (user_id, name, icon, color)
SELECT id, 'Доходы', '💰', '#22c55e'
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE groups.user_id = auth.users.id AND groups.name = 'Доходы');

-- Создаем категории для существующих пользователей
INSERT INTO public.categories (user_id, group_id, name, icon, type)
SELECT 
  u.id,
  g.id,
  cat.name,
  cat.icon,
  cat.type
FROM auth.users u
CROSS JOIN public.groups g
CROSS JOIN (
  VALUES 
    ('Продукты', '🍎', 'expense', 'На жизнь'),
    ('Кафе и рестораны', '🍕', 'expense', 'На жизнь'),
    ('Коммуналка', '⚡', 'expense', 'На жизнь'),
    ('Транспорт', '🚇', 'expense', 'Транспорт'),
    ('Такси', '🚕', 'expense', 'Транспорт'),
    ('Бензин', '⛽', 'expense', 'Транспорт'),
    ('Развлечения', '🎬', 'expense', 'Общие'),
    ('Здоровье', '💊', 'expense', 'Общие'),
    ('Одежда', '👕', 'expense', 'Общие'),
    ('Подарки', '🎁', 'expense', 'Общие'),
    ('Зарплата', '💵', 'income', 'Доходы'),
    ('Подработка', '💼', 'income', 'Доходы'),
    ('Инвестиции', '📈', 'income', 'Доходы')
) AS cat(name, icon, type, group_name)
WHERE g.user_id = u.id 
  AND g.name = cat.group_name
  AND NOT EXISTS (
    SELECT 1 FROM public.categories c 
    WHERE c.user_id = u.id AND c.name = cat.name
  );

