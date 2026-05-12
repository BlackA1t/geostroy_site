# Production deploy

Краткая инструкция для VPS с Ubuntu 24.04 и Docker.

## 1. Env

Скопировать пример env:

```powershell
Copy-Item deploy\.env.production.example deploy\.env.production
```

На сервере можно выполнить аналог:

```bash
cp deploy/.env.production.example deploy/.env.production
```

Заполнить реальные значения:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `FRONTEND_URL` и `CORS_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `COOKIE_SECURE`

Для запуска по HTTP/IP `COOKIE_SECURE=false`. После подключения домена и HTTPS поставить `COOKIE_SECURE=true`, а URL заменить на `https://...`.

## 2. Запуск контейнеров

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml up -d --build
```

## 3. Prisma

Применить миграции:

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy -w backend
```

Prisma Client генерируется при сборке backend image. Если нужно повторить вручную:

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml exec backend npm run prisma:generate -w backend
```

## 4. Проверка

Health-check:

```bash
curl http://localhost/api/health
```

Ожидаемый ответ:

```json
{"status":"ok"}
```

## 5. Логи

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml logs -f
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml logs -f backend
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml logs -f nginx
```

## 6. Обновление после git pull

```bash
git pull
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy -w backend
```

PostgreSQL data хранится в Docker volume `geostroy_postgres_data`, файлы заявок - в `geostroy_uploads`.
