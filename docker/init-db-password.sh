#!/bin/bash
# ============================================================================
# MeiLearning System — PostgreSQL Init Script
# ============================================================================
# Runs ONCE when database is first initialized (empty volume).
# Ensures the password is set correctly from POSTGRES_PASSWORD env var.
# ============================================================================
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
EOSQL

echo "✅ Database password synced with POSTGRES_PASSWORD env var."
