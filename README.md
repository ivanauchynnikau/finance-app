# Finance App - Веб-приложение для учета личных финансов

Мобильное веб-приложение для учета личных финансов с системой группировки категорий и минималистичным дизайном.

🔗 **Live Demo:** https://ivanauchynnikau.github.io/finance-app/  
🗄️ **Backend:** Supabase (PostgreSQL + Auth + Storage)

## ✨ Возможности

- 📊 **Круговая диаграмма** распределения расходов по группам и категориям
- 💰 **Учет транзакций** с доходами и расходами
- 📁 **Система категорий** с группировкой (аккордеон-интерфейс)
- 📈 **Отчеты** с детальной статистикой за выбранный период
- 📥 **Экспорт в CSV** всех транзакций
- 🌓 **Темная/светлая тема** с плавным переключением
- 📱 **Mobile-first** дизайн с скрываемым Tab Bar
- 🔐 **Авторизация** через Supabase
- ☁️ **Облачное хранилище** данных в Supabase

## 🛠 Технологии

- **Frontend**: React 18 + TypeScript
- **Сборка**: Vite
- **База данных**: Supabase (PostgreSQL)
- **State Management**: TanStack React Query
- **UI Components**: Radix UI
- **Стили**: Tailwind CSS
- **Графики**: Recharts
- **Формы**: React Hook Form + Zod
- **Уведомления**: Sonner
- **Роутинг**: React Router v6

## 📦 Установка

1. Клонируйте репозиторий и установите зависимости:

```bash
cd /home/ivan/work/finance-app
npm install
```

2. Настройте переменные окружения:

Скопируйте `.env.example` в `.env` и заполните:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Создайте базу данных в Supabase:

Выполните SQL из файла `supabase-schema.sql` в редакторе SQL Supabase.

Этот скрипт создаст:
- Таблицы: `groups`, `categories`, `transactions`
- RLS (Row Level Security) политики
- Индексы для производительности
- Триггер автоматического создания дефолтных категорий при регистрации

## 🚀 Запуск

### Режим разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### Сборка для продакшена

```bash
npm run build
```

### Предпросмотр продакшен-сборки

```bash
npm run preview
```

## 📂 Структура проекта

```
finance-app/
├── public/               # Статические файлы
│   └── manifest.json     # PWA manifest
├── src/
│   ├── components/       # React компоненты
│   │   ├── Auth/         # Авторизация (Login, Register)
│   │   ├── ui/           # UI компоненты (Radix UI)
│   │   ├── Layout.tsx    # Основной layout с Tab Bar
│   │   ├── AddTransactionDialog.tsx
│   │   ├── AddCategoryDialog.tsx
│   │   ├── AddGroupDialog.tsx
│   │   ├── TransactionList.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── contexts/         # React контексты
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Утилиты
│   │   ├── supabase.ts   # Supabase клиент и типы
│   │   └── utils.ts      # Вспомогательные функции
│   ├── pages/            # Страницы приложения
│   │   ├── Dashboard.tsx # Главная с диаграммой
│   │   ├── Transactions.tsx
│   │   ├── Categories.tsx
│   │   └── Reports.tsx
│   ├── services/         # Бизнес-логика
│   │   ├── groupService.ts
│   │   ├── categoryService.ts
│   │   └── transactionService.ts
│   ├── App.tsx           # Корневой компонент
│   ├── main.tsx          # Точка входа
│   └── index.css         # Глобальные стили
├── supabase-schema.sql   # SQL схема базы данных
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🎨 Дизайн

### Цветовая схема

**Темная тема (по умолчанию):**
- Фон: `#121212`
- Акцент: Фиолетовый `#8b5cf6`
- Текст: Белый с различной прозрачностью

**Светлая тема:**
- Фон: Белый
- Акцент: Синий `#3b82f6`
- Текст: Темно-серый

### Особенности UI

- **Mobile-first**: минимальная ширина 320px
- **Touch-friendly**: элементы управления не менее 44x44px
- **Скрываемый Tab Bar**: прячется при скролле вниз
- **Аккордеон категорий**: удобная группировка
- **Круговая диаграмма**: Recharts PieChart
- **Emoji иконки**: для категорий и групп

## 🗄 База данных

### Таблицы

1. **groups** - Группы категорий
   - `id`, `user_id`, `name`, `icon`, `color`, `is_default`

2. **categories** - Категории транзакций
   - `id`, `user_id`, `group_id`, `name`, `icon`, `type` (income/expense)

3. **transactions** - Транзакции
   - `id`, `user_id`, `category_id`, `type`, `amount`, `date`, `note`

### Предустановленные категории

При регистрации автоматически создаются:

**Группы:**
- 📁 Общие (дефолтная)
- 🏠 На жизнь
- 🚗 Транспорт
- 💰 Доходы

**Категории расходов:**
- 🍎 Продукты, 🍕 Кафе, ⚡ Коммуналка (На жизнь)
- 🚇 Транспорт, 🚕 Такси, ⛽ Бензин (Транспорт)
- 🎬 Развлечения, 💊 Здоровье, 👕 Одежда, 🎁 Подарки (Общие)

**Категории доходов:**
- 💵 Зарплата, 💼 Подработка, 📈 Инвестиции

## 🔒 Безопасность

- Row Level Security (RLS) включен для всех таблиц
- Пользователи видят только свои данные
- Дефолтная группа защищена от удаления
- При удалении группы категории переносятся в "Общие"

## 📱 PWA

Приложение готово к установке как Progressive Web App:
- Manifest.json настроен
- Работа в standalone режиме
- Адаптивные иконки (требуется добавить icon-192.png и icon-512.png)

## 🚧 TODO (будущие улучшения)

- [ ] Редактирование транзакций
- [ ] Удаление транзакций
- [ ] Редактирование категорий и групп
- [ ] Фильтры по дате в Transactions
- [ ] Мультивалютность
- [ ] Бюджеты и лимиты
- [ ] Push-уведомления
- [ ] Импорт банковских выписок
- [ ] Service Worker для оффлайн-работы
- [ ] Дополнительные типы диаграмм (линейные, столбчатые)

## 📄 Лицензия

MIT

---

**Разработано с 💜 с использованием современного стека технологий**
