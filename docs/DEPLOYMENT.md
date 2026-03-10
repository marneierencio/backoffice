# Guia de Deploy — Erencio.com Backoffice

## Ambientes

| Ambiente | Container Proxmox | Branch | URL | IP (interno) |
|----------|------------------|--------|-----|--------------|
| Produção | `backoffice` | `main` | https://backoffice.erencio.com | `192.168.1.90` |
| Desenvolvimento | `backoffice--dev` | `development` | https://backoffice--dev.erencio.com | `192.168.1.92` |

---

## Infraestrutura — Cloudflare Tunnel

O acesso externo (SSH e HTTP) é feito via **Cloudflare Tunnel**, sem expor portas
diretamente na internet. Cada container tem uma rota configurada no painel Cloudflare:

| Domínio | Caminho | Serviço interno |
|---------|---------|-----------------|
| `backoffice.erencio.com` | `^/ssh` | `ssh://192.168.1.90:22` |
| `backoffice--dev.erencio.com` | `^/ssh` | `ssh://192.168.1.92:22` |

> O GitHub Actions acessa os containers via SSH através do Cloudflare Tunnel,
> usando os hostnames acima como `PROD_SSH_HOST` e `DEV_SSH_HOST`.

---

## Pré-requisitos

### GitHub Secrets Necessários

Configure estes secrets em **Settings → Secrets and variables → Actions** no repositório:

### Secrets

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `PROD_SSH_HOST` | `backoffice-ssh.erencio.com` | Hostname do tunnel Cloudflare → produção |
| `PROD_SSH_USER` | `root` | Usuário SSH no container `backoffice` |
| `PROD_SSH_KEY` | _(chave ED25519 privada)_ | Chave privada correspondente a `~root/.ssh/authorized_keys` em `backoffice` |
| `DEV_SSH_HOST` | `backoffice-ssh--dev.erencio.com` | Hostname do tunnel Cloudflare → desenvolvimento |
| `DEV_SSH_USER` | `root` | Usuário SSH no container `backoffice--dev` |
| `DEV_SSH_KEY` | _(chave ED25519 privada)_ | Chave privada correspondente a `~root/.ssh/authorized_keys` em `backoffice--dev` |

> ⚠️ **As chaves SSH privadas nunca devem ser commitadas no repositório.** Elas existem
> apenas como GitHub Secrets.

> O `GITHUB_TOKEN` é gerado automaticamente pelo GitHub Actions — não precisa ser configurado manualmente. Ele é usado para publicar imagens no GHCR.

### Variables (não são secrets)

| Variable | Valor |
|----------|-------|
| `PROD_SERVER_URL` | `https://backoffice.erencio.com` |
| `DEV_SERVER_URL` | `https://backoffice--dev.erencio.com` |

### Preparar os Containers Proxmox

Em cada container, você precisa ter:
- Docker e Docker Compose instalados
- Um arquivo `.env` com as variáveis de ambiente (ver abaixo)
- O arquivo `docker-compose.yml` — **sincronizado automaticamente pelo CI/CD** a cada deploy
- O usuário SSH adicionado ao grupo `docker`

#### Estrutura de diretórios no container

```
/opt/backoffice/
├── docker-compose.yml   ← sincronizado pelo CI/CD a partir de packages/twenty-docker/docker-compose.yml
├── .env                 ← variáveis de ambiente (NÃO commitar)
└── backups/             ← backups automáticos do banco antes de cada deploy
```

> **Na primeira instalação**, copie manualmente o `docker-compose.yml` do repositório para o servidor
> antes do primeiro deploy automatizado.

#### Serviços Docker

O `docker-compose.yml` define quatro serviços:

| Serviço | Imagem | Descrição |
|---------|--------|-----------|
| `twenty-app` | `${TAG}` | Backend NestJS + frontend estático (porta 3000) |
| `twenty-worker` | `${TAG}` | Worker BullMQ para jobs em background |
| `twenty-db` | `postgres:16` | Banco de dados PostgreSQL |
| `twenty-redis` | `redis` | Cache e fila de jobs |

#### Arquivo `.env` por container

```bash
# Produção (/opt/backoffice/.env em backoffice)
ENVIRONMENT=production
TAG=ghcr.io/marneierencio/backoffice:latest  # atualizado automaticamente pelo CI/CD

# Aplicação
APP_SECRET=<string_aleatoria_longa>           # gere com: openssl rand -base64 32

# Banco de dados
PG_DATABASE_USER=twenty
PG_DATABASE_PASSWORD=<senha_segura>
PG_DATABASE_NAME=twenty_db

# URLs — SERVER_URL é o domínio BASE (sem subdomínio)
SERVER_URL=https://backoffice.erencio.com
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app

# Seleção de Cuidadores (obter em Settings > Developers > API Keys)
SELECAO_CUIDADORES_API_KEY=<api_key_do_workspace>

# E-mail via Resend/SMTP
EMAIL_DRIVER=smtp
EMAIL_FROM_ADDRESS=nao-responda@erencio.com
EMAIL_FROM_NAME=Backoffice - Erencio.com
EMAIL_SYSTEM_ADDRESS=sistema@erencio.com
EMAIL_SMTP_HOST=smtp.resend.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=resend
EMAIL_SMTP_PASSWORD=<resend_api_key>
```

```bash
# Desenvolvimento (/opt/backoffice/.env em backoffice--dev)
ENVIRONMENT=development
TAG=ghcr.io/marneierencio/backoffice:development  # atualizado automaticamente pelo CI/CD

# Aplicação — use valores DIFERENTES da produção
APP_SECRET=<string_aleatoria_diferente>           # gere com: openssl rand -base64 32

# Banco de dados
PG_DATABASE_USER=twenty
PG_DATABASE_PASSWORD=<senha_diferente_da_producao>
PG_DATABASE_NAME=twenty_db

# URLs
SERVER_URL=https://backoffice--dev.erencio.com
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app

# Seleção de Cuidadores — API Key do workspace de DEV (diferente da produção)
SELECAO_CUIDADORES_API_KEY=<api_key_do_workspace_dev>

# E-mail via Resend/SMTP
EMAIL_DRIVER=smtp
EMAIL_FROM_ADDRESS=nao-responda@erencio.com
EMAIL_FROM_NAME=Backoffice DEV - Erencio.com
EMAIL_SYSTEM_ADDRESS=sistema@erencio.com
EMAIL_SMTP_HOST=smtp.resend.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=resend
EMAIL_SMTP_PASSWORD=<resend_api_key>
```

> **Variáveis que NÃO existem no Twenty** (não usar — ignoradas silenciosamente):
> `POSTGRES_PASSWORD`, `FRONT_URL`, `EMAIL_SMTP_TLS_ENABLED`, `EMAIL_SMTP_SECURE`,
> `GRAPHQL_PLAYGROUND`, `IS_EDS_ENABLED`\*, `DEBUG_MODE`, `CORS_ALLOWED_ORIGINS`.
>
> \*`IS_EDS_ENABLED` é feature flag de banco de dados — ative em Settings → Feature Flags dentro do workspace.

---

## Como Funciona o Deploy Automático

### Deploy de Produção (`main` → `backoffice`)

1. **Trigger:** push na branch `main`
2. **Build:** GitHub Actions constrói a imagem Docker
3. **Publish:** Imagem publicada em `ghcr.io/marneierencio/backoffice:latest`
4. **Sincroniza** `docker-compose.yml` do repositório para `/opt/backoffice/docker-compose.yml` via SCP
5. **Deploy:** Via SSH no container `backoffice`:
   - Backup do banco (se `twenty-db` estiver rodando)
   - `docker pull` + atualiza `TAG` no `.env`
   - Para e recria apenas `twenty-app` e `twenty-worker` (preserva banco e redis)
   - `docker compose up -d`
6. **Healthcheck:** aguarda `http://localhost:3000/healthz` responder

### Deploy de Desenvolvimento (`development` → `backoffice--dev`)

Mesmo fluxo, mas com a tag `development` e apontando para `backoffice--dev`.

---

## Deploy Manual (Emergência)

```bash
# Acessar o container de produção via gateway Cloudflare
# (cloudflared está instalado no servidor gateway, não nos containers diretamente)
ssh root@192.168.1.90  # a partir do gateway

# Dentro do container, no diretório /opt/backoffice/
cd /opt/backoffice

# Puxar a versão mais recente
docker pull ghcr.io/marneierencio/backoffice:latest

# Reiniciar os serviços sem derrubar o banco
docker compose up -d --no-deps twenty-app twenty-worker

# Verificar logs
docker compose logs -f twenty-app
```

---

## Rollback

```bash
# Ver tags disponíveis no GHCR
# https://github.com/marneierencio/backoffice/pkgs/container/backoffice

# Editar o .env e setar a tag desejada
TAG=ghcr.io/marneierencio/backoffice:main-<sha_anterior>

# Ou diretamente no comando
docker compose up -d --no-deps \
  -e TAG=ghcr.io/marneierencio/backoffice:main-<sha_anterior> \
  twenty-app twenty-worker
```

---

## Configuração Inicial do Container (uma vez)

### Login no GHCR

Para que o container possa puxar imagens privadas do GHCR:

```bash
# No container Proxmox
echo $GHCR_TOKEN | docker login ghcr.io -u marneierencio --password-stdin
```

Onde `$GHCR_TOKEN` é um Personal Access Token com permissão `read:packages`.

### Copiar o docker-compose.yml pela primeira vez

O CI/CD sincroniza o arquivo a cada deploy, mas na primeira instalação é preciso copiá-lo manualmente.
A partir do servidor **gateway** (onde o cloudflared está instalado):

```bash
# Copiar o arquivo do repositório local para o servidor
scp -o "ProxyCommand=cloudflared access ssh --hostname %h" \
  packages/twenty-docker/docker-compose.yml \
  root@backoffice-ssh.erencio.com:/opt/backoffice/docker-compose.yml

# Para dev:
scp -o "ProxyCommand=cloudflared access ssh --hostname %h" \
  packages/twenty-docker/docker-compose.yml \
  root@backoffice-ssh--dev.erencio.com:/opt/backoffice/docker-compose.yml
```

Alternativamente, acesse o container diretamente pelo IP interno e crie o arquivo manualmente.

---

## Migrações de Banco de Dados

O Twenty executa migrações automaticamente ao iniciar (`DISABLE_DB_MIGRATIONS=false`).
Para ambientes de produção, recomenda-se:

1. Fazer backup do PostgreSQL antes de qualquer atualização de versão
2. Testar a migração em `backoffice-dev` primeiro
3. Verificar os logs após o deploy: `docker compose logs twenty-app | grep -i migr`

### Backup antes do deploy (produção)

```bash
# No container backoffice-main
cd /opt/backoffice
docker compose exec twenty-db pg_dump -U twenty twenty_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

---

## Variáveis de Ambiente Completas

Consulte `packages/twenty-docker/docker-compose.yml` para a lista completa
de variáveis de ambiente suportadas, incluindo integrações com Google, Microsoft,
e serviços de e-mail.
