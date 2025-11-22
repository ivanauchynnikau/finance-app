# Dream Box - Статус проекта

## 📋 Описание
Веб-приложение для визуализации и отслеживания прогресса накопления на мечту.

## 🛠 Технологии
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth + PostgreSQL + Storage)
- **Хостинг:** GitHub Pages
- **Домен:** my-dreambox.ru (в процессе настройки)

## ✅ Реализовано
1. ✅ Авторизация (email/password через Supabase)
2. ✅ CRUD операций с мечтами (dreams таблица)
3. ✅ Загрузка фото мечты (URL или файл с устройства)
4. ✅ Хранилище изображений (Supabase Storage, bucket: dream-images)
5. ✅ Landing page с описанием проекта
6. ✅ SEO оптимизация (meta теги, sitemap, robots.txt, JSON-LD)
7. ✅ Row Level Security (RLS) в Supabase
8. ✅ Деплой на GitHub Pages с CI/CD

## 🔄 В процессе
- **Настройка домена my-dreambox.ru:**
  - Домен куплен в HB.by
  - DNS записи добавлены (4 A-записи для GitHub Pages)
  - Проблема: регистратор разрешает только 1 A-запись
  - Ожидание: ответ от саппорта HB.by
  - Альтернативы: www.my-dreambox.ru (CNAME) или Cloudflare DNS

## 🔑 Переменные окружения
```env
VITE_SUPABASE_URL=https://qozxaqvrtaxhxvpwuhqo.supabase.co
VITE_SUPABASE_ANON_KEY=[в .env файле и GitHub Secrets]
```

## 📂 Ключевые файлы
- `src/lib/supabase.ts` - Supabase клиент
- `src/contexts/AuthContext.tsx` - Авторизация
- `src/services/dreamService.ts` - Работа с мечтами (CRUD)
- `src/services/storageService.ts` - Загрузка изображений
- `src/pages/Landing.tsx` - Landing page
- `src/pages/Index.tsx` - Главная страница приложения
- `.github/workflows/deploy.yml` - CI/CD для GitHub Pages

## 🗄 База данных (Supabase)
**Таблица: dreams**
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- dream_name (text)
- target_amount (numeric)
- current_amount (numeric, default: 0)
- image_url (text)
- created_at (timestamp)

**RLS Policies:**
- Users can only read/write their own dreams

## 🌐 Деплой
- **Продакшн:** https://amirak-dev.github.io/dream-box/
- **Будущий домен:** https://my-dreambox.ru (ожидает DNS)
- **Auto-deploy:** при push в main ветку

## 📝 Следующие шаги
1. Решить вопрос с DNS (ответ от HB.by или переход на Cloudflare)
2. Настроить SSL сертификат (автоматически после DNS)
3. Обновить все URL в коде на my-dreambox.ru после активации домена

## 🐛 Известные проблемы
- Нет (все работает)

---
**Обновлено:** 2025-10-20

