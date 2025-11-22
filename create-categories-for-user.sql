-- ========================================
-- СОЗДАНИЕ ДЕФОЛТНЫХ КАТЕГОРИЙ
-- ========================================
--
-- ИНСТРУКЦИЯ:
-- 1. Сначала узнайте ваш User ID:
--    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
--
-- 2. Замените 'YOUR_USER_ID' на ваш реальный ID
-- 3. Скопируйте весь скрипт и нажмите RUN
-- ========================================

DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID'; -- ← ЗАМЕНИТЕ НА ВАШ ID!
  default_group_id UUID;
  food_group_id UUID;
  transport_group_id UUID;
  income_group_id UUID;
BEGIN
  -- Проверяем что user_id не пустой
  IF v_user_id = 'YOUR_USER_ID' THEN
    RAISE EXCEPTION 'Замените YOUR_USER_ID на ваш реальный ID пользователя!';
  END IF;

  -- Проверяем есть ли уже категории
  IF EXISTS (SELECT 1 FROM categories WHERE user_id = v_user_id) THEN
    RAISE NOTICE 'У пользователя уже есть категории. Пропускаем.';
    RETURN;
  END IF;

  RAISE NOTICE 'Создаю категории для пользователя: %', v_user_id;

  -- ========================================
  -- СОЗДАНИЕ ГРУПП
  -- ========================================

  -- Группа "Общие" (дефолтная)
  INSERT INTO groups (user_id, name, icon, color, is_default)
  VALUES (v_user_id, 'Общие', '📁', '#6366f1', TRUE)
  RETURNING id INTO default_group_id;

  -- Группа "На жизнь"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (v_user_id, 'На жизнь', '🏠', '#10b981')
  RETURNING id INTO food_group_id;

  -- Группа "Транспорт"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (v_user_id, 'Транспорт', '🚗', '#f59e0b')
  RETURNING id INTO transport_group_id;

  -- Группа "Доходы"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (v_user_id, 'Доходы', '💰', '#22c55e')
  RETURNING id INTO income_group_id;

  -- ========================================
  -- СОЗДАНИЕ КАТЕГОРИЙ РАСХОДОВ
  -- ========================================

  -- Категории: На жизнь
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, food_group_id, 'Продукты', '🍎', 'expense'),
    (v_user_id, food_group_id, 'Кафе и рестораны', '🍕', 'expense'),
    (v_user_id, food_group_id, 'Коммуналка', '⚡', 'expense');

  -- Категории: Транспорт
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, transport_group_id, 'Транспорт', '🚇', 'expense'),
    (v_user_id, transport_group_id, 'Такси', '🚕', 'expense'),
    (v_user_id, transport_group_id, 'Бензин', '⛽', 'expense');

  -- Категории: Общие
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, default_group_id, 'Развлечения', '🎬', 'expense'),
    (v_user_id, default_group_id, 'Здоровье', '💊', 'expense'),
    (v_user_id, default_group_id, 'Одежда', '👕', 'expense'),
    (v_user_id, default_group_id, 'Подарки', '🎁', 'expense');

  -- ========================================
  -- СОЗДАНИЕ КАТЕГОРИЙ ДОХОДОВ
  -- ========================================

  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (v_user_id, income_group_id, 'Зарплата', '💵', 'income'),
    (v_user_id, income_group_id, 'Подработка', '💼', 'income'),
    (v_user_id, income_group_id, 'Инвестиции', '📈', 'income');

  -- ========================================
  -- ГОТОВО!
  -- ========================================

  RAISE NOTICE '✅ Успешно создано:';
  RAISE NOTICE '   4 группы категорий';
  RAISE NOTICE '   13 категорий (10 расходов + 3 дохода)';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Обновите страницу приложения (F5)';
END $$;

-- ========================================
-- ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ========================================

-- Смотрим созданные группы
SELECT 
  name as "Группа", 
  icon as "Иконка",
  (SELECT COUNT(*) FROM categories WHERE group_id = groups.id) as "Кол-во категорий"
FROM groups 
ORDER BY is_default DESC, name;

-- Смотрим созданные категории
SELECT 
  g.name as "Группа",
  c.name as "Категория",
  c.icon as "Иконка",
  c.type as "Тип"
FROM categories c
LEFT JOIN groups g ON c.group_id = g.id
ORDER BY g.name, c.type DESC, c.name;

