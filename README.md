# The Last of Guss - Браузерная игра

Соревновательная браузерная игра, где игроки соревнуются, кто быстрее и больше натапает по виртуальному гусю, подхватившему мутацию G-42.

## Архитектура

- **Backend**: Node.js + TypeScript + Fastify + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **База данных**: PostgreSQL

## Возможности

### Игровая механика
- Раунды с настраиваемой длительностью и cooldown
- Система очков: 1 тап = 1 очко, каждый 11-й тап = 10 очков
- Защита от race conditions через транзакции
- Автоматическое обновление статусов раундов

### Роли пользователей
- **Survivor** - обычный игрок, может тапать
- **Admin** - может создавать раунды + все возможности Survivor
- **Nikita** - особая роль: тапы работают, но очки не засчитываются

### Функциональность
- Автоматическая регистрация/вход по имени пользователя
- Real-time таймеры и обновления
- Responsive дизайн
- Поддержка нескольких экземпляров сервера

## Установка и запуск

### 1. Подготовка окружения

Создайте базу данных PostgreSQL и настройте переменные окружения:

```bash
# Backend (.env)
DATABASE_URL="postgresql://username:password@localhost:5432/last_of_guss"
PORT=3000
JWT_SECRET="jwt_secret_key_here"
ROUND_DURATION=60    # минуты
COOLDOWN_DURATION=30 # секунды
CORS_ORIGIN="http://localhost:5173"
```

### 2. Установка зависимостей

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend  
npm install
```

### 3. Настройка базы данных

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Запуск в режиме разработки

**Backend (терминал 1):**
```bash
cd backend
npm run dev
```

**Frontend (терминал 2):**
```bash
cd frontend
npm run dev
```

### 5. Запуск в продакшене

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Использование

1. Откройте http://localhost:5173
2. Войдите под любым именем (аккаунт создастся автоматически)
3. Если имя пользователя "admin" - получите роль администратора
4. Если имя "никита" - получите особую роль
5. Администраторы могут создавать раунды
6. Игроки могут тапать по гусю в активных раундах

## Особенности реализации

### Backend
- Использует строгий TypeScript с включенным strict mode
- Транзакции для предотвращения race conditions  
- JWT токены в HTTP-only cookies для безопасности
- Middleware для аутентификации и авторизации
- Периодическое обновление статусов раундов (каждую секунду)
- Готовность к горизонтальному масштабированию

### Frontend
- Zustand для управления состоянием
- React Router для маршрутизации
- Tailwind CSS для стилизации
- Автоматическое обновление данных
- Responsive дизайн с красивой анимацией тапов
- Real-time таймеры обратного отсчета

### Безопасность
- Защита от SQL инъекций через Prisma ORM
- JWT токены с ограниченным временем жизни
- CORS настройки для безопасности
- Валидация всех входящих данных

## API Endpoints

- `POST /auth/login` - Вход/регистрация
- `POST /auth/logout` - Выход
- `GET /rounds` - Список раундов  
- `POST /rounds` - Создание раунда (только админы)
- `GET /rounds/:id` - Информация о раунде
- `POST /tap` - Тап по гусю
- `GET /health` - Проверка здоровья сервиса

## Развертывание

Проект спроектирован для развертывания в виде:
- 1 база данных PostgreSQL
- 1 reverse proxy (nginx/traefik)  
- 3+ экземпляра backend приложения в Docker контейнерах
- Статические файлы frontend на CDN или nginx

Все экземпляры backend используют общую базу данных и JWT токены, поэтому пользователи могут быть обслужены любым экземпляром.

## Тестирование

Создайте тестовых пользователей:
- `admin` / `password` - администратор
- `никита` / `password` - особая роль  
- `player1` / `password` - обычный игрок

## Лицензия

MIT License
