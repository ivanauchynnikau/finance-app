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
CREATE POLICY "Users can view own groups" ON groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups" ON groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups" ON groups
  FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- Политики для categories
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

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
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для создания дефолтных категорий при регистрации
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
DECLARE
  default_group_id UUID;
  food_group_id UUID;
  transport_group_id UUID;
  income_group_id UUID;
BEGIN
  -- Создаем группу "Общие"
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
$$ language 'plpgsql';

-- Триггер для создания дефолтных категорий при регистрации
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();

