# 🚀 Быстрый старт DreamBox с Supabase

## ✅ Что уже сделано:

- ✅ Установлен Supabase SDK
- ✅ Создана система авторизации (Login/Register)
- ✅ Настроена работа с базой данных
- ✅ Добавлены защищенные маршруты
- ✅ Обновлен деплой для GitHub Pages
- ✅ Настроена миграция данных из localStorage

## 📝 Что нужно сделать ВАМ:

### 1️⃣ Создайте файл `.env` в корне проекта

```bash
# В корне проекта создайте файл .env
touch .env
```

Добавьте в него (замените на ваши данные):

```env
VITE_SUPABASE_URL=https://ваш-проект.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_длинный_ключ
SUPABASE_DB_PASSWORD=-!_UUL%?2MsvkcZ
```

### 2️⃣ Получите Supabase credentials

1. Откройте [supabase.com](https://app.supabase.com/)
2. Войдите через GitHub (если еще не входили)
3. У вас уже должен быть создан проект (вы давали пароль: `-!_UUL%?2MsvkcZ`)
4. Перейдите в **Project Settings** → **API**
5. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
6. Вставьте эти значения в файл `.env`

### 3️⃣ Создайте таблицу в Supabase

Откройте **SQL Editor** в Supabase и выполните этот SQL:

```sql
-- Создание таблицы dreams
CREATE TABLE dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users NOT NULL,
  dream_name TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  target_amount NUMERIC NOT NULL,
  time_value INTEGER NOT NULL,
  time_unit TEXT NOT NULL,
  saved_amount NUMERIC DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  last_saved_date TEXT
);

-- Включить Row Level Security
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view own dreams"
  ON dreams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dreams"
  ON dreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams"
  ON dreams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams"
  ON dreams FOR DELETE
  USING (auth.uid() = user_id);

-- Индекс для быстрого поиска
CREATE INDEX dreams_user_id_idx ON dreams(user_id);
```

### 4️⃣ Включите Email Auth в Supabase

1. **Authentication** → **Providers**
2. Найдите **Email**
3. Включите:
   - ✅ **Enable Email provider**
   - ⬜ **Confirm email** (отключите для разработки)
4. **Save**

### 5️⃣ Настройте Storage для загрузки фото (ВАЖНО!)

**Через SQL Editor (самый быстрый способ):**

1. Откройте **SQL Editor** в Supabase
2. Скопируйте и выполните этот SQL:

```sql
-- Создание публичного bucket для фото мечт
INSERT INTO storage.buckets (id, name, public)
VALUES ('dream-images', 'dream-images', true);

-- Политика: загрузка только в свою папку
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dream-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Политика: публичный просмотр
CREATE POLICY "Public images are accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dream-images');

-- Политика: удаление только своих файлов
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dream-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);
```

3. Нажмите **RUN** или Ctrl+Enter

**Или через интерфейс** (см. подробности в [STORAGE_SETUP.md](./STORAGE_SETUP.md))

### 6️⃣ Запустите проект

```bash
npm run dev
```

Откройте http://localhost:8080

### 7️⃣ Протестируйте

1. Перейдите на `/register` (откроется автоматически)
2. Зарегистрируйтесь с email и паролем
3. Создайте свою мечту:
   - Введите название
   - **Загрузите фото с устройства** или вставьте ссылку
   - Укажите сумму и срок
4. Попробуйте:
   - Добавить накопления
   - Выйти и войти снова
   - Отредактировать мечту

---

## 🌐 Деплой на GitHub Pages

### 1. Добавьте Secrets в GitHub

1. Откройте ваш репозиторий на GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret** для каждого:
   - **Name**: `VITE_SUPABASE_URL`, **Value**: ваш URL
   - **Name**: `VITE_SUPABASE_ANON_KEY`, **Value**: ваш ключ

### 2. Включите GitHub Pages

1. **Settings** → **Pages**
2. **Source**: выберите **GitHub Actions**

### 3. Настройте права Actions

1. **Settings** → **Actions** → **General**
2. **Workflow permissions**: **Read and write permissions** ✅
3. **Allow GitHub Actions to create and approve pull requests** ✅
4. **Save**

### 4. Сделайте push

```bash
git add .
git commit -m "Add Supabase integration"
git push
```

Через ~2 минуты ваш сайт будет доступен на:
```
https://ваш-username.github.io/dream-box/
```

---

## 🆘 Проблемы?

### "Отсутствуют переменные окружения Supabase"
→ Проверьте файл `.env`, перезапустите `npm run dev`

### "Invalid API key"
→ Перепроверьте ключи в Supabase → Project Settings → API

### "Row Level Security policy violation"
→ Убедитесь, что SQL скрипт выполнен полностью

### Данные не сохраняются
→ Откройте Table Editor → dreams, проверьте структуру

### Не могу загрузить фото с устройства
→ Убедитесь, что Storage bucket создан (см. шаг 5)
→ Проверьте политики Storage
→ См. [STORAGE_SETUP.md](./STORAGE_SETUP.md) для подробностей

---

## 📚 Подробные инструкции

- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - **Настройка загрузки фото**
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Детальная настройка Supabase
- [README.md](./README.md) - Основная документация

---

## 🎉 Готово!

После настройки у вас будет:
- ✅ Авторизация по email/password
- ✅ Облачное хранилище данных
- ✅ **Загрузка фото с устройства** 📸
- ✅ Защита данных через RLS
- ✅ Синхронизация между устройствами
- ✅ Автоматический деплой

