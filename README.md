# Геострой

Next.js + TypeScript приложение для сайта ООО «Геострой».

## Локальный запуск

1. Установить зависимости:

```bash
npm install
```

2. Запустить локальную PostgreSQL-базу:

```bash
docker compose up -d
```

3. Создать `.env` на основе `.env.example` и указать `DATABASE_URL`:

```bash
cp .env.example .env
```

4. Применить первую миграцию Prisma:

```bash
npx prisma migrate dev --name init
```

5. Запустить dev-сервер:

```bash
npm run dev
```

## Prisma

Полезные команды:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```
