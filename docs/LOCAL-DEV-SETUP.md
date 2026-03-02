# Local Development Setup (Windows + VS Code)

This guide is for contributors who want to validate changes locally before opening a PR.

## 1) Install prerequisites

### Required software

1. Install **Git**
2. Install **Docker Desktop** (with WSL2 backend enabled)
3. Install **VS Code**
4. Install **WSL2 + Ubuntu** (recommended on Windows)

> Why WSL2: this repo uses shell scripts and task shells (`/bin/zsh`) that are Unix-oriented.

### VS Code extensions

Install at least:

- ESLint
- Prettier
- EditorConfig
- Docker

## 2) Open the repo in WSL

From Ubuntu (WSL terminal):

```bash
cd /mnt/d/src/Erencio.com
git clone https://github.com/marneierencio/backoffice.git
cd backoffice
code .
```

If the repository is already cloned on `D:\src\Erencio.com\backoffice`, just:

```bash
cd /mnt/d/src/Erencio.com/backoffice
code .
```

## 3) Install Node and Yarn versions used by the repo

This workspace enforces:

- Node: `^24.5.0`
- Yarn: `4.9.2`

In WSL Ubuntu:

```bash
# install nvm (if needed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.nvm/nvm.sh

# install and use Node 24
nvm install 24
nvm use 24

# enable corepack and activate Yarn 4.9.2
corepack enable
corepack prepare yarn@4.9.2 --activate

# verify
node -v
corepack yarn -v
```

## 4) Install dependencies

At repository root:

```bash
cd /mnt/d/src/Erencio.com/backoffice
corepack yarn install
```

If you see peer dependency warnings (`YN0060`, `YN0002`), they are expected in this monorepo.

## 5) Start infrastructure (Postgres + Redis)

From root:

```bash
docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis
```

Confirm services are healthy:

```bash
docker ps
```

## 6) Generate local env files and databases

Run:

```bash
bash packages/twenty-utils/setup-dev-env.sh
```

This command:

- Resets env for `twenty-front` and `twenty-server`
- Creates PostgreSQL databases `default` and `test` (if they do not exist)

## 7) Run the app locally

From root:

```bash
corepack yarn start
```

Alternative split mode:

```bash
npx nx start twenty-front
npx nx start twenty-server
npx nx run twenty-server:worker
```

### Fast startup flows (SFDS2 login validation)

Before running the commands below, ensure **Docker Desktop is open**.

#### Option A — WSL (recommended)

Run in a WSL terminal:

```bash
set -e && cd /mnt/d/src/Erencio.com/backoffice && nvm use 24 && corepack enable && corepack prepare yarn@4.9.2 --activate && docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis && bash packages/twenty-utils/setup-dev-env.sh && (npx nx start twenty-server &) && npx nx start twenty-sfds2
```

#### Option B — Git Bash on Windows

Run in Git Bash from repository root (`D:/src/Erencio.com/backoffice`):

```bash
set -e && cd /d/src/Erencio.com/backoffice && docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis && bash packages/twenty-utils/setup-dev-env.sh
```

Then start in 2 terminals:

Terminal 1 (backend):

```bash
cd /d/src/Erencio.com/backoffice/packages/twenty-server && npx nest start --watch
```

If you prefer backend in Docker (instead of local Nest), run:

```bash
cd /d/src/Erencio.com/backoffice && SERVER_URL=http://127.0.0.1:3000 STORAGE_TYPE=local docker compose -f packages/twenty-docker/docker-compose.yml up -d server
```

Terminal 2 (SFDS2 frontend):

```bash
cd /d/src/Erencio.com/backoffice && ./.tools/node-v24.5.0-win-x64/corepack yarn nx start twenty-sfds2
```

Use this login in SFDS2:

- Email: `tim@apple.dev`
- Password: `tim@apple.dev`

## 8) Pre-push validation checklist (recommended)

Run only what is relevant to your change:

```bash
# Frontend
npx nx lint:diff-with-main twenty-front
npx nx typecheck twenty-front

# Backend
npx nx lint:diff-with-main twenty-server
npx nx typecheck twenty-server

# Targeted tests (preferred over full suite)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs
```

When changing GraphQL schema:

```bash
npx nx run twenty-front:graphql:generate
```

When changing entities/migrations:

```bash
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/<migration-name> -d src/database/typeorm/core/core.datasource.ts
```

## 9) SFDS2-specific check (for this branch context)

If your changes touch SFDS2, validate both frontends:

```bash
npx nx build twenty-front
npx nx build twenty-sfds2
```

`twenty-sfds2` uses Vite. Ensure `packages/twenty-sfds2/src/vite-env.d.ts` exists with:

```ts
/// <reference types="vite/client" />
```

This avoids TypeScript errors on `import.meta.env` during build.

## 10) Troubleshooting

- **Error: Node version doesn't match `^24.5.0`**
  Switch Node: `nvm use 24`

- **`yarn` command not found**
  Use Corepack form: `corepack yarn ...`

- **`psql` command not found while running setup script**
  Install PostgreSQL client inside WSL: `sudo apt-get update && sudo apt-get install -y postgresql-client`

- **Docker DB not reachable on localhost:5432**
  Check container status and port mapping:
  `docker compose -f packages/twenty-docker/docker-compose.yml ps`

- **`POST /graphql` fails on Windows with connection aborted/empty reply**
  Prefer IPv4 loopback (`127.0.0.1`) instead of `localhost` for local backend URL.
  When running backend via Docker, include:
  `SERVER_URL=http://127.0.0.1:3000 STORAGE_TYPE=local`

- **`npx nx start twenty-server` fails on Windows with `'NODE_ENV' is not recognized`**
  Use backend fallback command instead:
  `cd packages/twenty-server && npx nest start --watch`

- **Need a clean restart**
  ```bash
  npx nx reset
  docker compose -f packages/twenty-docker/docker-compose.yml down
  docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis
  bash packages/twenty-utils/setup-dev-env.sh
  ```

## 11) Daily quick start

```bash
cd /mnt/d/src/Erencio.com/backoffice
nvm use 24
docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis
bash packages/twenty-utils/setup-dev-env.sh
corepack yarn start
```
