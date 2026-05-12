# Геострой

Проект разделён на два workspace-приложения:

```text
geostroy/
├── frontend/  # Next.js UI
└── backend/   # NestJS API
```

## Env

Файлы `.env.example` коммитятся только как безопасные шаблоны. Реальные `.env` и `.env.local` не коммитятся.

После клонирования создайте локальные env-файлы:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Для backend замените шаблонный `DATABASE_URL` на реальную локальную строку. Для текущего `docker-compose.yml` пример такой:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/geostroy_db?schema=public
```

Frontend после чистки legacy API больше не использует Prisma и не требует `DATABASE_URL`.

## Backend Env

`backend/.env.example`:

```env
NODE_ENV=development
BACKEND_PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
JWT_ACCESS_SECRET=replace_with_access_secret
JWT_REFRESH_SECRET=replace_with_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
COOKIE_DOMAIN=
COOKIE_SECURE=false
```

## Frontend Env

`frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Локальный Запуск

1. Установите зависимости из корня:

```powershell
npm install
```

2. Запустите PostgreSQL:

```powershell
docker compose up -d
```

3. Примените существующие миграции backend:

```powershell
npm run prisma:migrate:deploy -w backend
```

4. Запустите backend:

```powershell
npm run dev:backend
```

5. Запустите frontend:

```powershell
npm run dev:frontend
```

Health endpoint backend:

```text
GET http://localhost:4000/api/health
```

Ожидаемый ответ:

```json
{
  "status": "ok"
}
```

## Auth

Пользовательские auth-действия frontend работают через NestJS backend:

- регистрация;
- вход;
- выход;
- получение текущего пользователя.

JWT не сохраняются в `localStorage` и не возвращаются в JSON. Backend ставит `httpOnly` cookies:

- `geostroy_access_token`
- `geostroy_refresh_token`

## API

Frontend отвечает за UI и обращается к backend API через `NEXT_PUBLIC_API_URL`.

В backend перенесены:

- auth;
- профиль пользователя и смена пароля;
- пользовательские заявки;
- гостевые заявки и claim-логика;
- callback-заявки;
- admin endpoints заявок, callback и пользователей;
- уведомления;
- admin overview counts;
- загрузка и удаление файлов заявок.

## Prisma

Prisma теперь находится только в backend:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`

Backend-команды:

```powershell
npm run prisma:validate:backend
npm run prisma:generate:backend
npm run prisma:migrate:deploy -w backend
```

## Проверки

Базовые команды после изменений:

```powershell
npm install
npm run build:backend
npm run build:frontend
npm run prisma:validate:backend
npm run prisma:generate:backend
npm run prisma:migrate:deploy -w backend
```

## Security TODO

Перед production-переключением нужно добавить CSRF-защиту для state-changing endpoints и настроить реальные `COOKIE_DOMAIN`, `COOKIE_SECURE`, `FRONTEND_URL` и секреты JWT.
