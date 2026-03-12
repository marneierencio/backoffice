# Configuração do Ambiente de Desenvolvimento Local (Windows + VS Code)

Este guia é para contribuidores que desejam validar alterações localmente antes de abrir um PR.

## 1) Instalar pré-requisitos

### Software necessário

1. Instalar **Git**
2. Instalar **Docker Desktop** (com backend WSL2 habilitado)
3. Instalar **VS Code**
4. Instalar **WSL2 + Ubuntu** (recomendado no Windows)

> Por que WSL2: este repositório utiliza shell scripts e task shells (`/bin/zsh`) orientados a Unix.

### Extensões do VS Code

Instale ao menos:

- ESLint
- Prettier
- EditorConfig
- Docker

## 2) Abrir o repositório no WSL

No Ubuntu (terminal WSL):

```bash
cd /mnt/d/src/Erencio.com
git clone https://github.com/marneierencio/backoffice.git
cd backoffice
code .
```

Se o repositório já estiver clonado em `D:\src\Erencio.com\backoffice`:

```bash
cd /mnt/d/src/Erencio.com/backoffice
code .
```

## 3) Instalar as versões do Node e Yarn usadas pelo repositório

Este workspace exige:

- Node: `^24.5.0`
- Yarn: `4.9.2`

No WSL Ubuntu:

```bash
# instalar nvm (se necessário)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.nvm/nvm.sh

# instalar e usar Node 24
nvm install 24
nvm use 24

# habilitar corepack e ativar Yarn 4.9.2
corepack enable
corepack prepare yarn@4.9.2 --activate

# verificar
node -v
corepack yarn -v
```

## 4) Instalar dependências

Na raiz do repositório:

```bash
cd /mnt/d/src/Erencio.com/backoffice
corepack yarn install
```

Se aparecerem avisos de peer dependency (`YN0060`, `YN0002`), são esperados neste monorepo.

## 5) Iniciar a infraestrutura (Postgres + Redis)

Na raiz:

```bash
docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis
```

Confirme que os serviços estão saudáveis:

```bash
docker ps
```

## 6) Gerar arquivos de ambiente e bancos de dados locais

Execute:

```bash
bash packages/twenty-utils/setup-dev-env.sh
```

Este comando:

- Reseta o ambiente para `twenty-front` e `twenty-server`
- Cria os bancos PostgreSQL `default` e `test` (se ainda não existirem)

## 7) Rodar a aplicação localmente

Na raiz:

```bash
corepack yarn start
```

Modo separado (cada serviço em um terminal):

```bash
npx nx start twenty-front
npx nx start twenty-server
npx nx run twenty-server:worker
```

### Fluxos de inicialização rápida (validação de login Erencio.com Backoffice)

Antes de rodar os comandos abaixo, certifique-se que o **Docker Desktop está aberto**.

#### Opção A — WSL (recomendado)

Execute em um terminal WSL:

```bash
set -e && cd /mnt/d/src/Erencio.com/backoffice && nvm use 24 && corepack enable && corepack prepare yarn@4.9.2 --activate && docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis && bash packages/twenty-utils/setup-dev-env.sh && (npx nx start twenty-server &) && npx nx start erencio-front
```

#### Opção B — Git Bash no Windows

Execute no Git Bash a partir da raiz do repositório (`D:/src/Erencio.com/backoffice`):

```bash
set -e && cd /d/src/Erencio.com/backoffice && docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis && bash packages/twenty-utils/setup-dev-env.sh
```

Depois inicie em 2 terminais:

Terminal 1 (backend):

```bash
cd /d/src/Erencio.com/backoffice/packages/twenty-server && npx nest start --watch
```

Se preferir o backend via Docker (em vez de Nest local):

```bash
cd /d/src/Erencio.com/backoffice && SERVER_URL=http://127.0.0.1:3000 STORAGE_TYPE=local docker compose -f packages/twenty-docker/docker-compose.yml up -d server
```

Terminal 2 (frontend Erencio.com Backoffice):

```bash
cd /d/src/Erencio.com/backoffice && ./.tools/node-v24.5.0-win-x64/corepack yarn nx start erencio-front
```

Use este login no Erencio.com Backoffice:

- Email: `tim@apple.dev`
- Senha: `tim@apple.dev`

## 8) Checklist de validação pré-push (recomendado)

Execute apenas o que é relevante para a sua alteração:

```bash
# Frontend
npx nx lint:diff-with-main twenty-front
npx nx typecheck twenty-front

# Backend
npx nx lint:diff-with-main twenty-server
npx nx typecheck twenty-server

# Testes direcionados (preferível ao suite completo)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs
```

Ao alterar schema GraphQL:

```bash
npx nx run twenty-front:graphql:generate
```

Ao alterar entidades/migrações:

```bash
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/<nome-da-migracao> -d src/database/typeorm/core/core.datasource.ts
```

## 9) Verificação específica do Erencio.com Backoffice

Se suas mudanças tocam o Erencio.com Backoffice, valide ambos os frontends:

```bash
npx nx build twenty-front
npx nx build erencio-front
```

O `erencio-front` usa Vite. Certifique-se que `packages/erencio-front/src/vite-env.d.ts` existe com:

```ts
/// <reference types="vite/client" />
```

Isso evita erros de TypeScript no `import.meta.env` durante o build.

## 10) Solução de Problemas

- **Erro: versão do Node não corresponde a `^24.5.0`**
  Troque o Node: `nvm use 24`

- **Comando `yarn` não encontrado**
  Use a forma Corepack: `corepack yarn ...`

- **`psql` não encontrado ao rodar o script de setup**
  Instale o cliente PostgreSQL no WSL: `sudo apt-get update && sudo apt-get install -y postgresql-client`

- **Banco Docker não acessível em localhost:5432**
  Verifique status e mapeamento de portas:
  `docker compose -f packages/twenty-docker/docker-compose.yml ps`

- **`POST /graphql` falha no Windows com conexão abortada/resposta vazia**
  Prefira o loopback IPv4 (`127.0.0.1`) ao invés de `localhost` para URL do backend local.
  Quando rodar o backend via Docker, inclua:
  `SERVER_URL=http://127.0.0.1:3000 STORAGE_TYPE=local`

- **`npx nx start twenty-server` falha no Windows com `'NODE_ENV' is not recognized`**
  Use o comando alternativo para o backend:
  `cd packages/twenty-server && npx nest start --watch`

- **Precisa de um restart limpo**
  ```bash
  npx nx reset
  docker compose -f packages/twenty-docker/docker-compose.yml down
  docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis
  bash packages/twenty-utils/setup-dev-env.sh
  ```

## 11) Início rápido diário

```bash
cd /mnt/d/src/Erencio.com/backoffice
nvm use 24
docker compose -f packages/twenty-docker/docker-compose.yml up -d db redis
bash packages/twenty-utils/setup-dev-env.sh
corepack yarn start
```
