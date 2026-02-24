# Sincronização com Upstream (Twenty CRM)

## Por que sincronizar?

O [Twenty CRM](https://github.com/twentyhq/twenty) recebe atualizações frequentes
(novas funcionalidades, correções de segurança, melhorias de performance). Manter
nosso fork sincronizado garante que os clientes se beneficiem dessas melhorias.

---

## Estratégia

```
twentyhq/twenty (upstream)
        │
        │  sync periódico (semanal / via GitHub Actions)
        ▼
upstream-sync/twenty-vX.Y.Z   ←── branch temporária automática
        │
        │  PR revisado por humanos
        ▼
   development   ←── validação em backoffice-dev
        │
        │  PR após validação
        ▼
     main   ←── produção backoffice-main
```

---

## Processo Automatizado (upstream-sync.yaml)

O workflow `.github/workflows/upstream-sync.yaml` roda semanalmente e:

1. Verifica se existe uma nova tag `vX.Y.Z` no upstream
2. Se sim, cria a branch `upstream-sync/twenty-vX.Y.Z`
3. Faz o merge do upstream nessa branch
4. Abre um Pull Request contra `development`
5. O PR descreve novidades e conflitos detectados

---

## Processo Manual

Quando precisar fazer a sincronização manualmente:

```bash
# 1. Adicionar o upstream como remote (apenas na primeira vez)
git remote add upstream https://github.com/twentyhq/twenty.git
git remote -v  # confirmar

# 2. Buscar as atualizações do upstream
git fetch upstream

# 3. Ver as releases disponíveis
git tag -l --sort=-v:refname | head -10

# 4. Criar uma branch para o sync
git checkout development
git pull origin development
git checkout -b upstream-sync/twenty-v1.X.Y

# 5. Fazer o merge da release desejada
git merge upstream/v1.X.Y  # ou a tag específica: git merge v1.X.Y

# 6. Resolver conflitos (ver seção abaixo)
# ... resolver ...
git add .
git commit -m "chore: sync upstream twenty v1.X.Y"

# 7. Push e abrir PR contra development
git push origin upstream-sync/twenty-v1.X.Y
```

---

## Resolvendo Conflitos

Os conflitos mais comuns ocorrem em:

| Arquivo | Estratégia |
|---------|-----------|
| `package.json` / `yarn.lock` | Manter versões do upstream; reverter apenas dependências que adicionamos |
| `packages/twenty-server/src/` | Analisar caso a caso — priorizar upstream para fixes de segurança |
| `.github/workflows/` | **Sempre manter NOSSOS workflows** (cd-deploy-*.yaml, upstream-sync.yaml) |
| `CLAUDE.md` | **Sempre manter NOSSA versão** |
| `docs/` | **Sempre manter NOSSA versão** |
| Arquivos de configuração raiz | Manter upstream, aplicar nossas exceções se necessário |

### Regra de ouro

> Se o conflito é em código que **nós modificamos intencionalmente**, nossa versão vence.
> Se é em código que **não tocamos**, a versão upstream vence.

---

## Checklist de Validação Pós-Sync

Após o merge em `development` e deploy em `backoffice-dev`:

- [ ] Login e autenticação funcionando
- [ ] Todos os workspaces de teste acessíveis
- [ ] Objetos customizados (se houver) ainda visíveis
- [ ] Workers processando filas normalmente
- [ ] Sem erros nos logs: `docker compose logs server worker`
- [ ] Migrações executadas com sucesso
- [ ] Testes de CI passando

---

## Politica de Versões

- Sincronizamos **patch releases** (v1.X.Y → v1.X.Z) com prioridade — geralmente
  contêm apenas correções de bugs e segurança.
- Sincronizamos **minor releases** (v1.X → v1.Y) com planejamento — podem ter
  mudanças de schema e migrações que requerem validação cuidadosa.
- Avaliamos **major releases** (v1 → v2) individualmente — podem exigir refatoração
  significativa.

---

## Comunicação de Mudanças

Após cada sync bem-sucedido, documentar no PR:
- Versão anterior e nova do Twenty
- Principais novidades desta versão (link para release notes)
- Conflitos encontrados e como foram resolvidos
- Impacto esperado nos workspaces em produção
