# 🚀 Настройка GitHub Pages

## ✅ Что уже настроено

- GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Vite конфигурация обновлена
- Автоматический деплой при пуше в master

## 📋 Пошаговая инструкция

### Шаг 1: Настройте Secrets в GitHub

1. Откройте ваш репозиторий: https://github.com/ivanauchynnikau/finance-app
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте два секрета:

**Секрет 1:**
- Name: `VITE_SUPABASE_URL`
- Value: Ваш Supabase URL (например: `https://xxxxx.supabase.co`)

**Секрет 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: Ваш Supabase anon ключ

### Шаг 2: Включите GitHub Pages

1. В репозитории перейдите в **Settings** → **Pages**
2. В разделе **Source** выберите:
   - Source: **GitHub Actions**
3. Сохраните

### Шаг 3: Запушьте изменения

Workflow файл уже создан, нужно его закоммитить:

```bash
cd /home/ivan/work/finance-app
git add .github/workflows/deploy.yml vite.config.ts GITHUB_PAGES_SETUP.md
git commit -m "feat: Настроен деплой на GitHub Pages"
git push origin master
```

### Шаг 4: Проверьте деплой

1. Перейдите на вкладку **Actions** в репозитории
2. Увидите запущенный workflow "Deploy to GitHub Pages"
3. Подождите ~2-3 минуты пока завершится
4. После успешного деплоя приложение будет доступно по адресу:

```
https://ivanauchynnikau.github.io/finance-app/
```

## 🔄 Автоматический деплой

Теперь при каждом пуше в master автоматически:
1. ✅ Устанавливаются зависимости
2. ✅ Собирается production сборка
3. ✅ Деплоится на GitHub Pages

## 🌐 Кастомный домен (опционально)

Если хотите использовать свой домен:

1. Купите домен
2. В настройках домена добавьте CNAME запись:
   ```
   CNAME → ivanauchynnikau.github.io
   ```
3. В репозитории Settings → Pages → Custom domain введите ваш домен
4. Обновите `vite.config.ts`:
   ```typescript
   base: '/', // вместо '/finance-app/'
   ```

## 📊 Структура деплоя

```
finance-app/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions workflow
├── dist/                    # Сборка (создается автоматически)
├── vite.config.ts          # Конфигурация с base path
└── package.json
```

## ⚙️ Конфигурация

### vite.config.ts
```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/finance-app/' : '/',
```

Это позволяет:
- Локально работать без префикса
- На GitHub Pages использовать `/finance-app/`
- При кастомном домене убрать префикс

### GitHub Actions Workflow

Основные шаги:
1. **Checkout** - клонирование кода
2. **Setup Node.js** - установка Node.js 18
3. **Install dependencies** - `npm ci`
4. **Build** - сборка с переменными окружения из Secrets
5. **Upload artifact** - загрузка dist/
6. **Deploy** - деплой на GitHub Pages

## 🐛 Решение проблем

### Проблема: "404 при переходе по URL"

**Решение:** HashRouter уже используется в приложении, проблем не будет.

### Проблема: "Build failed - missing secrets"

**Решение:** Проверьте что добавили оба секрета в Settings → Secrets.

### Проблема: "Белый экран на GitHub Pages"

**Решение:** 
1. Проверьте что `base: '/finance-app/'` в vite.config.ts
2. Проверьте консоль браузера (F12) на ошибки
3. Убедитесь что переменные окружения правильные

### Проблема: "Workflow не запускается"

**Решение:**
1. Убедитесь что файл в `.github/workflows/deploy.yml`
2. Проверьте что Settings → Pages → Source = "GitHub Actions"
3. Попробуйте запустить вручную: Actions → Deploy to GitHub Pages → Run workflow

## 📝 Полезные команды

```bash
# Локальная сборка для проверки
npm run build

# Предпросмотр production сборки
npm run preview

# Проверка размера сборки
du -sh dist/

# Ручной запуск workflow (из репозитория GitHub)
# Actions → Deploy to GitHub Pages → Run workflow
```

## 🎯 Checklist

- [ ] Добавлены Secrets в GitHub (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Включен GitHub Pages (Settings → Pages → Source: GitHub Actions)
- [ ] Закоммичен workflow файл
- [ ] Запушены изменения в master
- [ ] Проверен статус деплоя в Actions
- [ ] Приложение доступно по https://ivanauchynnikau.github.io/finance-app/

## 📧 Полезные ссылки

- Репозиторий: https://github.com/ivanauchynnikau/finance-app
- GitHub Actions: https://github.com/ivanauchynnikau/finance-app/actions
- Settings: https://github.com/ivanauchynnikau/finance-app/settings
- GitHub Pages: https://ivanauchynnikau.github.io/finance-app/

---

**После выполнения всех шагов приложение будет доступно онлайн! 🎉**

