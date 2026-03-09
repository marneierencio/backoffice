#!/bin/sh
set -e

setup_and_migrate_db() {
    if [ "${DISABLE_DB_MIGRATIONS}" = "true" ]; then
        echo "Database setup and migrations are disabled, skipping..."
        return
    fi

    echo "Running database setup and migrations..."

    # Run setup and migration scripts
    has_schema=$(psql -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'core')" ${PG_DATABASE_URL})
    if [ "$has_schema" = "f" ]; then
        echo "Database appears to be empty, running migrations."
        NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
        yarn database:migrate:prod
    fi

    yarn command:prod cache:flush
    yarn command:prod upgrade
    yarn command:prod cache:flush

    echo "Successfully migrated DB!"
}

register_background_jobs() {
    if [ "${DISABLE_CRON_JOBS_REGISTRATION}" = "true" ]; then
        echo "Cron job registration is disabled, skipping..."
        return
    fi

    echo "Registering background sync jobs..."
    if yarn command:prod cron:register:all; then
        echo "Successfully registered all background sync jobs!"
    else
        echo "Warning: Failed to register background jobs, but continuing startup..."
    fi
}

inject_selecao_config() {
    local config_file="/app/packages/twenty-server/dist/selecaoCuidadores/config.js"
    if [ -f "$config_file" ] && [ -n "${SELECAO_CUIDADORES_API_KEY:-}" ]; then
        echo "Injecting Seleção de Cuidadores API key..."
        sed -i "s|__SELECAO_API_KEY__|${SELECAO_CUIDADORES_API_KEY}|g" "$config_file"
    fi
}

setup_and_migrate_db
register_background_jobs
inject_selecao_config

# Continue with the original Docker command
exec "$@"
