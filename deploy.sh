#!/bin/bash
set -e
cd /opt/memasik
git pull
set -a
source /opt/memasik/.env.local
set +a
docker compose build
docker compose up -d --force-recreate
echo "✅ Deployed!"
