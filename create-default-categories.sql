-- Шаг 1: Узнайте ваш USER_ID
-- Выполните: SELECT id FROM auth.users;
-- Скопируйте ваш ID и замените 'YOUR_USER_ID' ниже

-- Шаг 2: Замените YOUR_USER_ID на ваш реальный ID
-- Например: 'dbd6e849-9b15-40b8-9ebf-0a4c217b615b'

-- Создание групп
INSERT INTO groups (user_id, name, icon, color, is_default) VALUES
  ('YOUR_USER_ID', 'Общие', '📁', '#6366f1', TRUE),
  ('YOUR_USER_ID', 'На жизнь', '🏠', '#10b981', FALSE),
  ('YOUR_USER_ID', 'Транспорт', '🚗', '#f59e0b', FALSE),
  ('YOUR_USER_ID', 'Доходы', '💰', '#22c55e', FALSE);

-- Создание категорий (замените UUID группы после создания групп)
-- Сначала выполните запрос выше, потом узнайте ID групп:
-- SELECT id, name FROM groups WHERE user_id = 'YOUR_USER_ID';

-- После того как узнаете ID групп, выполните:
-- INSERT INTO categories (user_id, group_id, name, icon, type) VALUES
--   ('YOUR_USER_ID', 'ID_ГРУППЫ_НА_ЖИЗНЬ', 'Продукты', '🍎', 'expense'),
--   ('YOUR_USER_ID', 'ID_ГРУППЫ_НА_ЖИЗНЬ', 'Кафе и рестораны', '🍕', 'expense'),
--   ...

