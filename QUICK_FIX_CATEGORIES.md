# 🔧 Быстрое решение: Создание дефолтных категорий

## Проблема
Категории не отображаются в приложении.

## Решение

### Вариант 1: Через Supabase Dashboard (РЕКОМЕНДУЕТСЯ)

1. **Откройте Supabase Dashboard**
   - Перейдите на https://supabase.com
   - Откройте ваш проект
   - Перейдите в **SQL Editor**

2. **Узнайте ваш User ID**

Выполните этот запрос:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

Скопируйте ваш `id` (например: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

3. **Создайте категории**

Скопируйте код ниже, **ЗАМЕНИТЕ** `YOUR_USER_ID` на ваш реальный ID и выполните:

```sql
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID'; -- ЗАМЕНИТЕ НА ВАШ ID!
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

4. **Проверьте результат**

```sql
-- Проверка групп
SELECT * FROM groups WHERE user_id = 'YOUR_USER_ID';

-- Проверка категорий
SELECT * FROM categories WHERE user_id = 'YOUR_USER_ID';
```

5. **Обновите страницу в браузере**

Нажмите F5 или Ctrl+R в приложении.

---

### Вариант 2: Через приложение

Если SQL схема выполнена и триггер настроен:

1. **Выйдите из аккаунта** (Settings → Выход)
2. **Зарегистрируйте новый аккаунт**
3. Категории создадутся автоматически при регистрации

---

### Вариант 3: Добавьте категории вручную

1. Откройте раздел **"Категории"** в приложении
2. Нажмите **"+ Добавить группу"**
3. Создайте группу (например, "Продукты 🍎")
4. Откройте группу и нажмите **"+ Добавить категорию"**
5. Создайте категории

---

## Проверка таблиц

Убедитесь, что таблицы созданы:

```sql
-- Проверка существования таблиц
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('groups', 'categories', 'transactions');

-- Проверка RLS
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('groups', 'categories', 'transactions');
```

Если таблиц нет - выполните `supabase-schema.sql` полностью!

---

## 🎯 Результат

После выполнения у вас будет:

**4 группы:**
- 📁 Общие
- 🏠 На жизнь  
- 🚗 Транспорт
- 💰 Доходы

**13 категорий:**
- 10 категорий расходов
- 3 категории доходов

---

## ❗ Если ничего не помогло

1. Проверьте консоль браузера (F12) на ошибки
2. Проверьте что RLS policies настроены
3. Убедитесь что переменные окружения правильные
4. Проверьте что вы залогинены в приложении

```sql
-- Временно отключить RLS для отладки
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- НЕ ЗАБУДЬТЕ ВКЛЮЧИТЬ ОБРАТНО!
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

