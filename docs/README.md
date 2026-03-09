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

## EDS — Erencio Design System

### Visão Geral

| Documento | Descrição |
|-----------|-----------|
| [DUAL-FRONTEND.md](DUAL-FRONTEND.md) | Arquitetura dual-frontend (Twenty + EDS), feature flag `IS_EDS_ENABLED`, modelo de dados |
| [EDS-MIGRATION.md](EDS-MIGRATION.md) | Roadmap de migração EDS: Fases 0–6, status atual, dependências |
| [EDS-CONTRIBUTING.md](EDS-CONTRIBUTING.md) | Guia de contribuição: estrutura de pacotes, como adicionar componentes/páginas, tokens, code style |
| [EDS-COMPONENTS.md](EDS-COMPONENTS.md) | Catálogo de componentes das Fases 0–2 com exemplos de código e tokens |

### Especificações por Fase

| Documento | Fase | Escopo |
|-----------|------|--------|
| [EDS-PHASE1-RECORD-LISTING.md](EDS-PHASE1-RECORD-LISTING.md) | Fase 1 | Listagem de registros: DataTable, Pagination, SearchBar, páginas de lista |
| [EDS-PHASE2-RECORD-DETAIL.md](EDS-PHASE2-RECORD-DETAIL.md) | Fase 2 | Detalhe de registros: Avatar, Tabs, Modal, Toast, InlineEdit, páginas de detalhe |
| [EDS-PHASE3-CORE-CRM-ACTIONS.md](EDS-PHASE3-CORE-CRM-ACTIONS.md) | Fase 3 | Ações CRM: FormElement, Combobox, ConfirmDialog, RecordForm, páginas de criação |
| [EDS-PHASE4-NAVIGATION-PRODUCTIVITY.md](EDS-PHASE4-NAVIGATION-PRODUCTIVITY.md) | Fase 4 | Navegação e produtividade: CommandMenu, GlobalSearch, Kanban, Calendário, Notificações |

## Aplicativos Públicos

| Documento | Descrição |
|-----------|-----------|
| [SELECAO-CUIDADORES.md](SELECAO-CUIDADORES.md) | Pacote `twenty-selecao-cuidadores`: app público de cadastro de candidatos para seleção de cuidadores — arquitetura, passo a passo de criação e deploy |

## Pull Requests

| Documento | Descrição |
|-----------|-----------|
| [PULL-REQUESTS/PULL-REQUEST-000001.md](PULL-REQUESTS/PULL-REQUEST-000001.md) | PR #1 — Implementação inicial do EDS (Fases 0–4) |

## Aplicativos Públicos

| Documento | Descrição |
|-----------|-----------|
| [SELECAO-CUIDADORES.md](SELECAO-CUIDADORES.md) | Seleção de Cuidadores: pacote, deploy, API Key, guia passo-a-passo para novos apps públicos |

---

## Guia Rápido para Agentes de IA

1. **Entender o projeto:** Comece por [ARCHITECTURE.md](ARCHITECTURE.md) e [DUAL-FRONTEND.md](DUAL-FRONTEND.md)
2. **Configurar ambiente:** Siga [LOCAL-DEV-SETUP.md](LOCAL-DEV-SETUP.md)
3. **Contribuir com componentes EDS:** Leia [EDS-CONTRIBUTING.md](EDS-CONTRIBUTING.md) e consulte [EDS-COMPONENTS.md](EDS-COMPONENTS.md) para padrões
4. **Implementar nova fase:** Consulte a especificação da fase correspondente (EDS-PHASE*.md)
5. **Deploy:** Siga [DEPLOYMENT.md](DEPLOYMENT.md)
6. **Sincronizar upstream:** Siga [UPSTREAM-SYNC.md](UPSTREAM-SYNC.md)

## Convenções dos Documentos

- Todos os documentos usam **Markdown** com blocos de código TypeScript/GraphQL/CSS em inglês
- Prosa, títulos e descrições estão em **PT-BR**
- Nomes de componentes, hooks e variáveis seguem as convenções do código-fonte (inglês)
- Cada documento EDS-PHASE* segue a mesma estrutura: Escopo → Componentes → Hooks → Páginas → GraphQL → Tokens → Acessibilidade → Definição de Pronto
