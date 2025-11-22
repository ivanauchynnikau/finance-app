# 🗄️ Пошаговая настройка базы данных

## Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://supabase.com
2. Войдите в свой аккаунт
3. Откройте проект: **nsmudcoswdfvyywwusix**

## Шаг 2: Проверьте существующие таблицы

1. В левом меню выберите **Table Editor**
2. Посмотрите какие таблицы есть

**Должно быть:**
- groups
- categories  
- transactions

**Если таблиц нет** - переходите к Шагу 3.

## Шаг 3: Создание таблиц (если их нет)

1. В левом меню выберите **SQL Editor**
2. Нажмите **New query**
3. Скопируйте ВСЁ содержимое из файла ниже

### 📄 Полная SQL схема:

```sql
-- Finance App Database Schema

-- Группы категорий
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📁',
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Категории
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💰',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Транзакции
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_group_id ON categories(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);

-- Row Level Security (RLS) Policies

-- Включаем RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Политики для groups
DROP POLICY IF EXISTS "Users can view own groups" ON groups;
CREATE POLICY "Users can view own groups" ON groups
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own groups" ON groups;
CREATE POLICY "Users can insert own groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own groups" ON groups;
CREATE POLICY "Users can update own groups" ON groups
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own groups" ON groups;
CREATE POLICY "Users can delete own groups" ON groups
  FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- Политики для categories
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для updated_at
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Нажмите **RUN** (или Ctrl+Enter)
5. Должно появиться сообщение "Success"

## Шаг 4: Создание дефолтных категорий

Теперь создадим категории для вашего пользователя.

1. Узнайте ваш **User ID**. Выполните в SQL Editor:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

Скопируйте ваш `id` (UUID формата: a1b2c3d4-e5f6-7890-abcd-ef1234567890)

2. Выполните скрипт создания категорий (замените YOUR_USER_ID):

```sql
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID'; -- ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ ID!
  default_group_id UUID;
  food_group_id UUID;
  transport_group_id UUID;
  income_group_id UUID;
BEGIN
  -- Создаем группу "Общие"
  INSERT INTO groups (user_id, name, icon, color, is_default)
  VALUES (v_user_id, 'Общие', '📁', '#6366f1', TRUE)
  RETURNING id INTO default_group_id;

  -- Создаем группу "На жизнь"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (v_user_id, 'На жизнь', '🏠', '#10b981')
  RETURNING id INTO food_group_id;

  -- Создаем группу "Транспорт"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (v_user_id, 'Транспорт', '🚗', '#f59e0b')
  RETURNING id INTO transport_group_id;

  -- Создаем группу "Доходы"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (v_user_id, 'Доходы', '💰', '#22c55e')
  RETURNING id INTO income_group_id;

  -- Категории расходов: На жизнь
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, food_group_id, 'Продукты', '🍎', 'expense'),
    (v_user_id, food_group_id, 'Кафе и рестораны', '🍕', 'expense'),
    (v_user_id, food_group_id, 'Коммуналка', '⚡', 'expense');

  -- Категории расходов: Транспорт
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, transport_group_id, 'Транспорт', '🚇', 'expense'),
    (v_user_id, transport_group_id, 'Такси', '🚕', 'expense'),
    (v_user_id, transport_group_id, 'Бензин', '⛽', 'expense');

  -- Категории расходов: Общие
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, default_group_id, 'Развлечения', '🎬', 'expense'),
    (v_user_id, default_group_id, 'Здоровье', '💊', 'expense'),
    (v_user_id, default_group_id, 'Одежда', '👕', 'expense'),
    (v_user_id, default_group_id, 'Подарки', '🎁', 'expense');

  -- Категории доходов
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, income_group_id, 'Зарплата', '💵', 'income'),
    (v_user_id, income_group_id, 'Подработка', '💼', 'income'),
    (v_user_id, income_group_id, 'Инвестиции', '📈', 'income');

  RAISE NOTICE 'Дефолтные категории созданы успешно!';
END $$;
```

3. Нажмите **RUN**

## Шаг 5: Проверка

Выполните эти запросы чтобы убедиться что все создано:

```sql
-- Проверка групп
SELECT id, name, icon FROM groups;

-- Проверка категорий
SELECT c.name as category, c.icon, g.name as group_name 
FROM categories c 
LEFT JOIN groups g ON c.group_id = g.id;

-- Должно быть 4 группы и 13 категорий
```

## Шаг 6: Обновите приложение

1. Вернитесь в браузер с приложением
2. Нажмите **F5** (обновить страницу)
3. Перейдите в раздел **"Категории"**
4. Должны появиться группы с категориями!

## 🎯 Результат

После выполнения всех шагов у вас будет:

✅ 3 таблицы: groups, categories, transactions
✅ RLS политики настроены
✅ 4 группы категорий
✅ 13 категорий (10 расходов + 3 дохода)

---

## ❗ Если возникли проблемы

### Проблема: "relation does not exist"
**Решение:** Выполните Шаг 3 заново

### Проблема: "permission denied"
**Решение:** Проверьте что RLS policies созданы (Шаг 3)

### Проблема: Категории не появляются
**Решение:** 
1. Проверьте в SQL Editor: `SELECT * FROM categories;`
2. Если пусто - выполните Шаг 4
3. Убедитесь что ваш user_id правильный

### Проблема: Ошибка в консоли браузера
**Решение:**
1. Откройте DevTools (F12)
2. Вкладка Console
3. Скопируйте текст ошибки
4. Проверьте что переменные окружения правильные в `.env`

---

## 🆘 Нужна помощь?

Напишите какую ошибку видите и на каком шаге, помогу разобраться!

