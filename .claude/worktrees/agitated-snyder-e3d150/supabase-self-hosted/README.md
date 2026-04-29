# Self-hosted Supabase для memasik.fun

Запуск собственного инстанса Supabase рядом с memasik-приложением.
Все запросы идут через Traefik (`api.memasik.fun`), Studio лежит за DASHBOARD basic auth внутри Kong.

## Что внутри

- `docker-compose.yml` — стек (db, kong, auth, rest, storage, imgproxy, meta, studio, realtime, supavisor, functions, analytics, vector). Адаптирован под Traefik из официального шаблона.
- `.env.example` — переменные окружения. Секреты генерируются `generate-keys.sh`.
- `volumes/` — конфиги Kong/DB/pooler/logs/functions из официального шаблона.
- `generate-keys.sh` — генератор JWT_SECRET / ANON_KEY / SERVICE_ROLE_KEY / прочих секретов.
- `migrate/migrate-storage.sh` — bash, копирующий файлы из старого Supabase в новый.

## Развёртывание (один раз)

Все команды на сервере, где стоят memasik + Traefik (`/opt/memasik`).

```bash
cd /opt/memasik
git pull
cd supabase-self-hosted

# 1. Сгенерировать .env с секретами
cp .env.example .env
bash generate-keys.sh --update-env

# 2. Подставить домен и пароль для Studio
sed -i 's|^SUPABASE_HOSTNAME=.*|SUPABASE_HOSTNAME=api.memasik.fun|' .env
sed -i 's|^SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://api.memasik.fun|' .env
sed -i 's|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://api.memasik.fun|' .env
# поменять DASHBOARD_PASSWORD внутри .env вручную

# 3. Старт
docker compose up -d
docker compose ps           # все сервисы должны быть healthy через ~1 минуту
docker compose logs -f kong # должна выдать сертификат Let's Encrypt
```

После старта:
- API: `https://api.memasik.fun`
- Studio: `https://api.memasik.fun` в браузере → попросит DASHBOARD логин/пароль
- Postgres (для миграции/psql): `127.0.0.1:5432` на сервере (только локально)

## DNS

Перед первым запуском в DNS зоны `memasik.fun` добавить A-запись:

```
api.memasik.fun.   A   85.239.54.199
```

Без неё Let's Encrypt не сможет выдать сертификат.

## Миграция данных со старого Supabase

Делается один раз из live-сессии (Claude через MCP + SSH). Шаги:

1. Применить все миграции схемы из старого проекта в новой БД (`docker exec -i supabase-db psql ...`).
2. Скопировать `auth.users` + `auth.identities` (с bcrypt хешами — пароли продолжат работать).
3. Скопировать `public.profiles`, `words`, `word_feedback`, `word_views`, `user_suggestions`.
4. `INSERT INTO storage.buckets ('word-images', 'word-images', true);`
5. Скопировать файлы через `migrate/migrate-storage.sh`.
6. `UPDATE words SET image_url = REPLACE(image_url, 'old-host', 'api.memasik.fun');`

## Переключение memasik на новый Supabase

В `/opt/memasik/.env`:

```
NEXT_PUBLIC_SUPABASE_URL=https://api.memasik.fun
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY из supabase-self-hosted/.env>
```

Потом:
```bash
cd /opt/memasik && bash deploy.sh
```

## Бэкапы

DB persisted at `volumes/db/data` (gitignored). Storage at `volumes/storage`.
Простой бэкап:
```bash
cd /opt/memasik/supabase-self-hosted
docker compose exec -T db pg_dump -U postgres postgres | gzip > /var/backups/memasik-supabase-$(date +%F).sql.gz
tar czf /var/backups/memasik-storage-$(date +%F).tar.gz volumes/storage
```

## Восстановление / обновление

```bash
docker compose pull
docker compose up -d
```
