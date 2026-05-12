# Геострой

Сайт и информационная система для ООО «Геострой».
Пользователи могут отправлять заявки, прикреплять файлы и отслеживать статусы обработки.
Администратор может обрабатывать заявки, менять статусы, оставлять комментарии и управлять пользователями.
Также поддерживаются гостевые заявки и заявки на обратный звонок.

## Стек

- Frontend: Next.js, React, TypeScript
- Backend: NestJS, TypeScript, Prisma
- Database: PostgreSQL
- Auth: JWT, httpOnly cookies
- Monorepo: npm workspaces

## Структура

```text
geostroy/
├── frontend/   # Next.js интерфейс
├── backend/    # NestJS API и Prisma
└── docker-compose.yml
```

## Запуск

Установить зависимости:

```powershell
npm install
```

Создать env-файлы:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

`backend/.env` содержит настройки backend, БД и JWT.
`frontend/.env.local` содержит адрес backend API.
Реальные env-файлы не коммитятся.

Запустить PostgreSQL:

```powershell
docker compose up -d
```

Подготовить Prisma:

```powershell
npm run prisma:generate:backend
npm run prisma:migrate:deploy -w backend
```

Запустить backend:

```powershell
npm run dev:backend
```

Запустить frontend:

```powershell
npm run dev:frontend
```

Адреса:

- frontend: http://localhost:3000
- backend API: http://localhost:4000/api
- health-check: http://localhost:4000/api/health

## Сборка

```powershell
npm run build:backend
npm run build:frontend
```

## Дополнительно

- Frontend не подключается к БД напрямую.
- Prisma находится только в backend.
- `node_modules`, build-файлы, env-файлы и uploads не коммитятся.
