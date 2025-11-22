-- Скрипт для создания дефолтных категорий вручную
-- Замените 'YOUR_USER_ID' на ваш ID пользователя из auth.users

-- 1. Сначала узнайте ваш user_id:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Замените в переменной ниже:
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

