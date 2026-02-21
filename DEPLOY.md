# 🌐 Деплой PvZ Online на Render.com (бесплатно, 24/7)

## Что такое Render.com?
Render.com — бесплатный хостинг для Node.js приложений. Сервер будет работать **24/7 без вашего ПК**.

---

## 📋 Шаг 1: Установите Git

1. Скачайте Git: https://git-scm.com/download/win
2. Установите с настройками по умолчанию
3. Перезапустите VS Code

---

## 📋 Шаг 2: Создайте аккаунт на GitHub

1. Зайдите на https://github.com
2. Нажмите **Sign up** → создайте аккаунт
3. Подтвердите email

---

## 📋 Шаг 3: Загрузите проект на GitHub

Откройте терминал в папке проекта и выполните:

```bash
git init
git add .
git commit -m "PvZ Online game"
git branch -M main
```

Затем на GitHub:
1. Нажмите **+** → **New repository**
2. Название: `pvz-online`
3. Выберите **Private** (приватный)
4. Нажмите **Create repository**
5. Скопируйте команды из раздела "push an existing repository" и выполните их:

```bash
git remote add origin https://github.com/ВАШ_НИК/pvz-online.git
git push -u origin main
```

---

## 📋 Шаг 4: Деплой на Render.com

1. Зайдите на https://render.com
2. Нажмите **Get Started for Free**
3. Войдите через **GitHub** (кнопка "Sign in with GitHub")
4. Нажмите **New +** → **Web Service**
5. Выберите ваш репозиторий `pvz-online`
6. Настройки:
   - **Name**: pvz-online
   - **Region**: Frankfurt (EU Central) — ближайший к России
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
7. Нажмите **Create Web Service**

⏳ Подождите 2-3 минуты пока деплой завершится.

После деплоя вы получите ссылку вида:
```
https://pvz-online.onrender.com
```

---

## ⚠️ Важные особенности бесплатного плана Render

- **Сервер засыпает** через 15 минут неактивности
- При первом запросе после сна — **загружается ~30 секунд**
- Чтобы сервер не засыпал — используйте UptimeRobot (бесплатно):
  1. Зайдите на https://uptimerobot.com
  2. Создайте аккаунт
  3. Нажмите **Add New Monitor**
  4. Тип: **HTTP(s)**
  5. URL: `https://pvz-online.onrender.com`
  6. Интервал: **5 минут**
  7. Нажмите **Create Monitor**

Теперь сервер будет работать **постоянно**!

---

## 📋 Шаг 5: База данных на Render

На Render файловая система **временная** — db.json сбрасывается при перезапуске.

### Решение: Используйте переменную окружения для пути к БД

В настройках Render → **Environment** добавьте:
```
DB_PATH = /tmp/db.json
```

Или используйте **MongoDB Atlas** (бесплатно):
1. Зайдите на https://mongodb.com/atlas
2. Создайте бесплатный кластер
3. Получите строку подключения

---

## 🔄 Обновление игры

После изменений в коде:

```bash
git add .
git commit -m "Обновление игры"
git push
```

Render автоматически задеплоит новую версию!

---

## 🆓 Альтернативы Render.com

| Сервис | Бесплатно | Особенности |
|--------|-----------|-------------|
| **Railway.app** | $5/мес кредиты | Не засыпает, быстрый |
| **Fly.io** | 3 VM бесплатно | Не засыпает |
| **Glitch.com** | Да | Засыпает, медленный |
| **Cyclic.sh** | Да | Не засыпает |

### Рекомендация: Railway.app
1. Зайдите на https://railway.app
2. Войдите через GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Выберите репозиторий
5. Готово! Ссылка появится автоматически

---

## 📱 Доступ с телефона

После деплоя на Render/Railway — игра доступна с **любого устройства** по ссылке:
```
https://pvz-online.onrender.com
```

Поделитесь этой ссылкой с друзьями — они смогут играть без установки!
