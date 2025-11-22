-- ========================================
-- АВТОМАТИЧЕСКОЕ СОЗДАНИЕ КАТЕГОРИЙ ПРИ РЕГИСТРАЦИИ
-- ========================================
-- Этот триггер автоматически создаст 4 группы и 13 категорий
-- для каждого нового пользователя
-- ========================================

-- Функция создания дефолтных категорий
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
DECLARE
  default_group_id UUID;
  food_group_id UUID;
  transport_group_id UUID;
  income_group_id UUID;
BEGIN
  -- Создаем группу "Общие" (дефолтная)
  INSERT INTO groups (user_id, name, icon, color, is_default)
  VALUES (NEW.id, 'Общие', '📁', '#6366f1', TRUE)
  RETURNING id INTO default_group_id;

  -- Создаем группу "На жизнь"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (NEW.id, 'На жизнь', '🏠', '#10b981')
  RETURNING id INTO food_group_id;

  -- Создаем группу "Транспорт"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (NEW.id, 'Транспорт', '🚗', '#f59e0b')
  RETURNING id INTO transport_group_id;

  -- Создаем группу "Доходы"
  INSERT INTO groups (user_id, name, icon, color)
  VALUES (NEW.id, 'Доходы', '💰', '#22c55e')
  RETURNING id INTO income_group_id;

  -- Категории расходов: На жизнь
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (NEW.id, food_group_id, 'Продукты', '🍎', 'expense'),
    (NEW.id, food_group_id, 'Кафе и рестораны', '🍕', 'expense'),
    (NEW.id, food_group_id, 'Коммуналка', '⚡', 'expense');

  -- Категории расходов: Транспорт
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (NEW.id, transport_group_id, 'Транспорт', '🚇', 'expense'),
    (NEW.id, transport_group_id, 'Такси', '🚕', 'expense'),
    (NEW.id, transport_group_id, 'Бензин', '⛽', 'expense');

  -- Категории расходов: Общие
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (NEW.id, default_group_id, 'Развлечения', '🎬', 'expense'),
    (NEW.id, default_group_id, 'Здоровье', '💊', 'expense'),
    (NEW.id, default_group_id, 'Одежда', '👕', 'expense'),
    (NEW.id, default_group_id, 'Подарки', '🎁', 'expense');

  -- Категории доходов
  INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
    (NEW.id, income_group_id, 'Зарплата', '💵', 'income'),
    (NEW.id, income_group_id, 'Подработка', '💼', 'income'),
    (NEW.id, income_group_id, 'Инвестиции', '📈', 'income');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаем триггер на регистрацию нового пользователя
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- ========================================
-- ГОТОВО!
-- ========================================
-- Теперь при регистрации нового пользователя
-- автоматически создадутся:
-- ✅ 4 группы (Общие, На жизнь, Транспорт, Доходы)
-- ✅ 13 категорий (10 расходов + 3 дохода)
-- ========================================

