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
- Um arquivo `.env` com as variáveis de ambiente (ver seção abaixo)
- Um arquivo `docker-compose.yml` copiado de `packages/twenty-docker/docker-compose.yml`
- O usuário SSH adicionado ao grupo `docker`

#### Estrutura de diretórios no container

```
/opt/backoffice/
├── docker-compose.yml   ← cópia do packages/twenty-docker/docker-compose.yml
└── .env                 ← variáveis de ambiente (NÃO commitar)
```

#### Arquivo `.env` mínimo por container

```bash
# Produção (/opt/backoffice/.env em backoffice-main)
SERVER_URL=https://backoffice.erencio.com
APP_SECRET=<string_aleatoria_longa>
PG_DATABASE_PASSWORD=<senha_segura>

# Multi-workspace habilitado
IS_MULTIWORKSPACE_ENABLED=true

# Tag da imagem — atualizada automaticamente pelo CI/CD
TAG=ghcr.io/marneierencio/backoffice:latest
```

```bash
# Desenvolvimento (/opt/backoffice/.env em backoffice-dev)
SERVER_URL=https://backoffice--dev.erencio.com
APP_SECRET=<string_aleatoria_diferente>
PG_DATABASE_PASSWORD=<senha_segura>

IS_MULTIWORKSPACE_ENABLED=true

TAG=ghcr.io/marneierencio/backoffice:development
```

---

## Como Funciona o Deploy Automático

### Deploy de Produção (`main` → `backoffice`)

1. **Trigger:** push na branch `main`
2. **Build:** GitHub Actions constrói a imagem Docker
3. **Publish:** Imagem publicada em `ghcr.io/marneierencio/backoffice:latest`
4. **Deploy:** Via SSH no container `backoffice`:
   ```bash
   docker pull ghcr.io/marneierencio/backoffice:latest
   docker compose up -d --no-deps server worker
   ```
5. **Migrações:** Executadas automaticamente pelo `twenty-server` na inicialização
   (controlado por `DISABLE_DB_MIGRATIONS`)

### Deploy de Desenvolvimento (`development` → `backoffice--dev`)

Mesmo fluxo, mas com a tag `development` e apontando para `backoffice--dev`.

---

## Deploy Manual (Emergência)

```bash
# Conectar ao container de produção via Cloudflare Tunnel
# (requer cloudflared instalado localmente)
ssh root@backoffice.erencio.com

# Dentro do container, no diretório /opt/backoffice/
cd /opt/backoffice

# Puxar a versão mais recente
docker pull ghcr.io/marneierencio/backoffice:latest

# Reiniciar os serviços sem derrubar o banco
docker compose up -d --no-deps server worker

# Verificar logs
docker compose logs -f server
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
  server worker
```

---

## Adicionando o GitHub ao Container (uma vez)

Para que o container possa puxar imagens do GHCR:

```bash
# No container Proxmox
echo $GHCR_TOKEN | docker login ghcr.io -u marneierencio --password-stdin
```

Onde `$GHCR_TOKEN` é um Personal Access Token com permissão `read:packages`.

---

## Migrações de Banco de Dados

O Twenty executa migrações automaticamente ao iniciar (`DISABLE_DB_MIGRATIONS=false`).
Para ambientes de produção, recomenda-se:

1. Fazer backup do PostgreSQL antes de qualquer atualização de versão
2. Testar a migração em `backoffice-dev` primeiro
3. Verificar os logs após o deploy: `docker compose logs server | grep -i migr`

### Backup antes do deploy (produção)

```bash
# No container backoffice-main
cd /opt/backoffice
docker compose exec db pg_dump -U postgres default > backup-$(date +%Y%m%d-%H%M%S).sql
```

---

## Variáveis de Ambiente Completas

Consulte `packages/twenty-docker/docker-compose.yml` para a lista completa
de variáveis de ambiente suportadas, incluindo integrações com Google, Microsoft,
e serviços de e-mail.
