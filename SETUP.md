# Быстрый старт

## 1. Установка зависимостей

```bash
cd /home/ivan/work/finance-app
npm install
```

## 2. Настройка Supabase

### Создайте проект в Supabase

1. Перейдите на https://supabase.com
2. Создайте новый проект
3. Скопируйте URL и anon key

### Выполните SQL схему

1. Откройте SQL Editor в Supabase
2. Скопируйте содержимое файла `supabase-schema.sql`
3. Выполните SQL
4. Проверьте, что созданы таблицы: `groups`, `categories`, `transactions`

## 3. Настройка переменных окружения

Файл `.env` уже создан. Откройте его и замените значения:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Запуск приложения

```bash
npm run dev
```

Откройте http://localhost:5173

## 5. Регистрация

1. Перейдите по ссылке Register
2. Введите email и пароль
3. После регистрации автоматически создадутся дефолтные категории
4. Войдите в приложение

## Готово! 🎉

Теперь можете:
- Добавлять транзакции (кнопка + на главной)
- Управлять категориями (раздел Категории)
- Смотреть статистику (раздел Отчеты)
- Экспортировать данные в CSV (меню в Отчетах)
- Переключать темную/светлую тему (иконка настроек)

## Возможные проблемы

### Ошибка при регистрации

Проверьте в Supabase:
- Authentication > Email Auth включен
- Email confirmation может быть отключен для разработки

### Не загружаются данные

1. Проверьте RLS policies в Database > Policies
2. Убедитесь, что выполнили весь SQL из `supabase-schema.sql`

### Ошибки компиляции

```bash
rm -rf node_modules package-lock.json
npm install
```

