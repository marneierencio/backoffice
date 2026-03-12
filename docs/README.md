# Documentação do Erencio.com Backoffice

Índice centralizado da documentação do projeto. Todos os documentos estão em **português brasileiro (PT-BR)**.

> **Para agentes de IA:** este arquivo serve como ponto de partida para entender a estrutura do projeto. Leia os documentos na ordem sugerida abaixo conforme a necessidade.

---

## Arquitetura e Infraestrutura

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Visão geral da arquitetura, diagrama de deployment, stack tecnológica, estrutura do monorepo |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Guia de deploy: secrets, ambientes (prod/dev), rollback, GitHub Actions |
| [UPSTREAM-SYNC.md](UPSTREAM-SYNC.md) | Processo de sincronização com o upstream Twenty CRM |

## Setup de Desenvolvimento

| Documento | Descrição |
|-----------|-----------|
| [LOCAL-DEV-SETUP.md](LOCAL-DEV-SETUP.md) | Pré-requisitos, instalação, WSL, Docker, troubleshooting |
| [I18N-GUIDE.md](I18N-GUIDE.md) | Guia de internacionalização com Lingui |

## Erencio.com Backoffice

### Visão Geral

| Documento | Descrição |
|-----------|-----------|
| [DUAL-FRONTEND.md](DUAL-FRONTEND.md) | Arquitetura dual-frontend (Twenty + Erencio.com Backoffice), feature flag `IS_BACKOFFICE_ENABLED`, modelo de dados |
| [BACKOFFICE-MIGRATION.md](BACKOFFICE-MIGRATION.md) | Roadmap de migração Erencio.com Backoffice: Fases 0–6, status atual, dependências |
| [BACKOFFICE-CONTRIBUTING.md](BACKOFFICE-CONTRIBUTING.md) | Guia de contribuição: estrutura de pacotes, como adicionar componentes/páginas, tokens, code style |
| [BACKOFFICE-COMPONENTS.md](BACKOFFICE-COMPONENTS.md) | Catálogo de componentes das Fases 0–2 com exemplos de código e tokens |

### Especificações por Fase

| Documento | Fase | Escopo |
|-----------|------|--------|
| [BACKOFFICE-PHASE1-RECORD-LISTING.md](BACKOFFICE-PHASE1-RECORD-LISTING.md) | Fase 1 | Listagem de registros: DataTable, Pagination, SearchBar, páginas de lista |
| [BACKOFFICE-PHASE2-RECORD-DETAIL.md](BACKOFFICE-PHASE2-RECORD-DETAIL.md) | Fase 2 | Detalhe de registros: Avatar, Tabs, Modal, Toast, InlineEdit, páginas de detalhe |
| [BACKOFFICE-PHASE3-CORE-CRM-ACTIONS.md](BACKOFFICE-PHASE3-CORE-CRM-ACTIONS.md) | Fase 3 | Ações CRM: FormElement, Combobox, ConfirmDialog, RecordForm, páginas de criação |
| [BACKOFFICE-PHASE4-NAVIGATION-PRODUCTIVITY.md](BACKOFFICE-PHASE4-NAVIGATION-PRODUCTIVITY.md) | Fase 4 | Navegação e produtividade: CommandMenu, GlobalSearch, Kanban, Calendário, Notificações |

## Aplicativos Públicos

| Documento | Descrição |
|-----------|-----------|
| [SELECAO-CUIDADORES.md](SELECAO-CUIDADORES.md) | Pacote `erencio-selecao-cuidadores`: app público de cadastro de candidatos para seleção de cuidadores — arquitetura, passo a passo de criação e deploy |

## Pull Requests

| Documento | Descrição |
|-----------|-----------|
| [PULL-REQUESTS/PULL-REQUEST-000001.md](PULL-REQUESTS/PULL-REQUEST-000001.md) | PR #1 — Implementação inicial do Erencio.com Backoffice (Fases 0–4) |

## Aplicativos Públicos

| Documento | Descrição |
|-----------|-----------|
| [SELECAO-CUIDADORES.md](SELECAO-CUIDADORES.md) | Seleção de Cuidadores: pacote, deploy, API Key, guia passo-a-passo para novos apps públicos |

---

## Guia Rápido para Agentes de IA

1. **Entender o projeto:** Comece por [ARCHITECTURE.md](ARCHITECTURE.md) e [DUAL-FRONTEND.md](DUAL-FRONTEND.md)
2. **Configurar ambiente:** Siga [LOCAL-DEV-SETUP.md](LOCAL-DEV-SETUP.md)
3. **Contribuir com componentes Erencio.com Backoffice:** Leia [BACKOFFICE-CONTRIBUTING.md](BACKOFFICE-CONTRIBUTING.md) e consulte [BACKOFFICE-COMPONENTS.md](BACKOFFICE-COMPONENTS.md) para padrões
4. **Implementar nova fase:** Consulte a especificação da fase correspondente (BACKOFFICE-PHASE*.md)
5. **Deploy:** Siga [DEPLOYMENT.md](DEPLOYMENT.md)
6. **Sincronizar upstream:** Siga [UPSTREAM-SYNC.md](UPSTREAM-SYNC.md)

## Convenções dos Documentos

- Todos os documentos usam **Markdown** com blocos de código TypeScript/GraphQL/CSS em inglês
- Prosa, títulos e descrições estão em **PT-BR**
- Nomes de componentes, hooks e variáveis seguem as convenções do código-fonte (inglês)
- Cada documento BACKOFFICE-PHASE* segue a mesma estrutura: Escopo → Componentes → Hooks → Páginas → GraphQL → Tokens → Acessibilidade → Definição de Pronto
