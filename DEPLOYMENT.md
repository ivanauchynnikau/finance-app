# Инструкция по деплою на GitHub Pages

## Настройка GitHub Pages

### 1. Включение GitHub Pages в настройках репозитория

1. Перейдите в ваш репозиторий на GitHub
2. Нажмите на вкладку **Settings** (Настройки)
3. Прокрутите вниз до раздела **Pages** в левом меню
4. В разделе **Source** выберите **GitHub Actions**
5. Сохраните изменения

**Важно:** Если вы видите ошибку "Get Pages site failed", это означает что GitHub Pages еще не включен. В этом случае:
- Убедитесь, что репозиторий **публичный**
- Подождите 2-3 минуты после изменения видимости репозитория
- Попробуйте снова выбрать **GitHub Actions** как источник

### 2. Настройка прав доступа для GitHub Actions

1. В настройках репозитория перейдите в раздел **Actions** → **General**
2. Прокрутите вниз до раздела **Workflow permissions**
3. Выберите **Read and write permissions**
4. Поставьте галочку **Allow GitHub Actions to create and approve pull requests**
5. Нажмите **Save**

### 2.1. Проверка видимости репозитория

**Важно:** Если репозиторий был приватным, убедитесь что:
1. Перейдите в **Settings** → **General**
2. Прокрутите вниз до раздела **Danger Zone**
3. Если репозиторий приватный, нажмите **Change repository visibility**
4. Выберите **Make public** (для GitHub Pages нужен публичный репозиторий)
5. Подтвердите изменения

### 3. Настройка ветки

Убедитесь, что ваш основной код находится в ветке `main` или `master`. GitHub Actions workflow настроен для работы с обеими ветками.

### 4. Автоматический деплой

После настройки GitHub Pages, каждый раз когда вы будете пушить изменения в основную ветку, GitHub Actions автоматически:

1. Соберет проект (`npm run build`)
2. Задеплоит его на GitHub Pages

### 5. Проверка деплоя

После успешного деплоя ваш сайт будет доступен по адресу:
```
https://[ваш-username].github.io/dream-box/
```

## Возможные проблемы и решения

### Проблема: Сайт не открывается
**Решение:** 
- Убедитесь, что в настройках репозитория включен GitHub Pages
- Проверьте, что выбран **GitHub Actions** как источник
- Подождите несколько минут после деплоя

### Проблема: Ресурсы не загружаются (CSS, JS файлы)
**Решение:**
- Проверьте, что в `vite.config.ts` правильно настроен `base` путь
- Убедитесь, что имя репозитория в конфигурации совпадает с реальным

### Проблема: GitHub Actions не запускается
**Решение:**
- Проверьте, что файл `.github/workflows/deploy.yml` существует
- Убедитесь, что вы пушите в основную ветку (`main` или `master`)
- Проверьте логи в разделе Actions вашего репозитория

### Проблема: Ошибка "Write access to repository not granted" (403)
**Решение:**
- Перейдите в **Settings** → **Actions** → **General**
- В разделе **Workflow permissions** выберите **Read and write permissions**
- Поставьте галочку **Allow GitHub Actions to create and approve pull requests**
- Нажмите **Save**
- Запустите workflow заново

### Проблема: Репозиторий был приватным
**Решение:**
- Убедитесь, что репозиторий **публичный** (GitHub Pages работает только с публичными репозиториями)
- Перейдите в **Settings** → **General** → **Danger Zone**
- Нажмите **Change repository visibility** → **Make public**
- После изменения видимости подождите несколько минут и попробуйте деплой снова

### Проблема: "Get Pages site failed" или "Not Found"
**Решение:**
- Убедитесь, что GitHub Pages включен в **Settings** → **Pages**
- Выберите **GitHub Actions** как источник
- Если репозиторий был приватным, подождите 2-3 минуты после изменения видимости
- Попробуйте перезапустить workflow после настройки Pages

### Проблема: 404 ошибка при переходе по прямым ссылкам
**Решение:**
- Создан файл `public/404.html` для обработки клиентского роутинга
- GitHub Pages теперь корректно обрабатывает React Router маршруты

## Структура файлов для деплоя

```
.github/
  workflows/
    deploy.yml          # GitHub Actions workflow
vite.config.ts          # Конфигурация Vite с base path
public/
  404.html              # Обработка 404 ошибок для клиентского роутинга
  robots.txt            # Настройки для поисковых ботов
package.json            # Скрипты и зависимости
```

## Полезные ссылки

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)

