-- Скрипт создания дефолтных категорий для ВСЕХ существующих пользователей
-- Просто скопируйте и выполните в Supabase SQL Editor

DO $$
DECLARE
  user_record RECORD;
  default_group_id UUID;
  food_group_id UUID;
  transport_group_id UUID;
  income_group_id UUID;
  categories_count INT;
BEGIN
  -- Перебираем всех пользователей
  FOR user_record IN SELECT id, email FROM auth.users
  LOOP
    -- Проверяем, есть ли уже категории у пользователя
    SELECT COUNT(*) INTO categories_count FROM categories WHERE user_id = user_record.id;
    
    IF categories_count = 0 THEN
      RAISE NOTICE 'Создаю категории для пользователя: % (ID: %)', user_record.email, user_record.id;
      
      -- Создаем группу "Общие"
      INSERT INTO groups (user_id, name, icon, color, is_default)
      VALUES (user_record.id, 'Общие', '📁', '#6366f1', TRUE)
      RETURNING id INTO default_group_id;

      -- Создаем группу "На жизнь"
      INSERT INTO groups (user_id, name, icon, color)
      VALUES (user_record.id, 'На жизнь', '🏠', '#10b981')
      RETURNING id INTO food_group_id;

      -- Создаем группу "Транспорт"
      INSERT INTO groups (user_id, name, icon, color)
      VALUES (user_record.id, 'Транспорт', '🚗', '#f59e0b')
      RETURNING id INTO transport_group_id;

      -- Создаем группу "Доходы"
      INSERT INTO groups (user_id, name, icon, color)
      VALUES (user_record.id, 'Доходы', '💰', '#22c55e')
      RETURNING id INTO income_group_id;

      -- Категории расходов: На жизнь
      INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
        (user_record.id, food_group_id, 'Продукты', '🍎', 'expense'),
        (user_record.id, food_group_id, 'Кафе и рестораны', '🍕', 'expense'),
        (user_record.id, food_group_id, 'Коммуналка', '⚡', 'expense');

      -- Категории расходов: Транспорт
      INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
        (user_record.id, transport_group_id, 'Транспорт', '🚇', 'expense'),
        (user_record.id, transport_group_id, 'Такси', '🚕', 'expense'),
        (user_record.id, transport_group_id, 'Бензин', '⛽', 'expense');

      -- Категории расходов: Общие
      INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
        (user_record.id, default_group_id, 'Развлечения', '🎬', 'expense'),
        (user_record.id, default_group_id, 'Здоровье', '💊', 'expense'),
        (user_record.id, default_group_id, 'Одежда', '👕', 'expense'),
        (user_record.id, default_group_id, 'Подарки', '🎁', 'expense');

      -- Категории доходов
      INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
        (user_record.id, income_group_id, 'Зарплата', '💵', 'income'),
        (user_record.id, income_group_id, 'Подработка', '💼', 'income'),
        (user_record.id, income_group_id, 'Инвестиции', '📈', 'income');

      RAISE NOTICE '✅ Создано 4 группы и 13 категорий для %', user_record.email;
    ELSE
      RAISE NOTICE 'ℹ️  Пользователь % уже имеет % категорий, пропускаем', user_record.email, categories_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🎉 Готово! Проверьте приложение.';
END $$;

