# Plano de Migração Incremental do Erencio.com Backoffice

Este documento descreve a estratégia para migração gradual de telas do frontend Twenty (padrão) para a interface Erencio.com Backoffice (Erencio.com Backoffice).

## Princípios

- **Sem migração forçada**: usuários escolhem sua interface; admins podem impor via política da workspace
- **Paridade funcional por último**: o frontend Erencio.com Backoffice alcança paridade gradualmente — páginas ausentes fazem fallback graciosamente
- **Releases independentes**: cada sprint pode entregar novas páginas Erencio.com Backoffice sem afetar o frontend padrão
- **Compatível com a API**: ambos os frontends chamam a mesma API GraphQL — sem alterações no backend por página

## Fases de Migração

### Fase 0 — Fundação ✅
- [x] Estrutura do pacote erencio-front
- [x] Design tokens com CSS custom properties (`--backoffice-g-*`)
- [x] Classes CSS utilitárias (`.eds-*`)
- [x] Componentes primitivos: Button, Input, Card, Badge
- [x] Layout: Shell (topbar + sidebar retrátil)
- [x] Contexto de autenticação (login JWT, persistência de sessão)
- [x] Página Dashboard
- [x] Página de configurações de perfil com troca de frontend
- [x] Backend: `user.frontendPreference` + `workspace.frontendPolicy`
- [x] Lógica de seleção de frontend (hook `useFrontendShell`)
- [x] Integração nas configurações do usuário (SettingsExperience)
- [x] Integração nas configurações da workspace (SettingsWorkspace)
- [x] Feature flag `IS_BACKOFFICE_ENABLED`

### Fase 1 — Listagem de Registros ✅
- [x] Componente Select
- [x] Componente DataTable com ordenação e paginação
- [x] Barra de busca (SearchBar)
- [x] Página de lista de Contatos
- [x] Página de lista de Empresas
- [x] Página de lista de Negócios/Oportunidades

### Fase 2 — Detalhe do Registro ✅
- [x] Página de visualização de registro
- [x] Edição de campos inline
- [x] Componente Modal
- [x] Componente Tabs
- [x] Sistema de notificações Toast
- [x] Componente Avatar

### Fase 3 — Ações CRM Essenciais ✅
- [x] Formulário de criação de registro
- [x] Formulário de edição de registro
- [x] Diálogo de confirmação de exclusão
- [x] Campos de relacionamento
- [x] Campo de upload de arquivo

### Fase 4 — Navegação e Produtividade ✅
- [x] Integração do menu de comandos (Command Menu)
- [x] Busca global (Global Search)
- [x] Painel de notificações
- [x] Visualização de calendário
- [x] Visualização Kanban

### Fase 5 — Configurações (Admin)
- [x] Configurações completas da workspace
- [x] Gerenciamento de membros
- [x] Gerenciamento de papéis (roles)
- [x] Configurações do modelo de dados
- [x] Chaves de API
- [x] Faturamento

### Fase 6 — Paridade Funcional ✅
- [x] Todas as páginas restantes migradas
- [x] Erencio.com Backoffice pode ser definido como padrão da workspace
- [x] Feature flag `IS_BACKOFFICE_ENABLED` passa a ser habilitada por padrão

## Estratégia de Fallback

Para páginas ainda não migradas no Erencio.com Backoffice, duas estratégias são possíveis:

### Opção A: Redirecionar para o Twenty (atual)
Se um usuário navega para `/backoffice/contacts` mas a página ainda não foi implementada, redireciona para o caminho equivalente no Twenty (`/contacts`).

### Opção B: Iframe embutido (futuro)
Incorporar a página do Twenty em um iframe dentro do shell Erencio.com Backoffice para uma experiência integrada enquanto a migração está em andamento.

Atualmente a **Opção A** está implementada implicitamente — o `AppRouter.tsx` só possui rotas para páginas implementadas; rotas não reconhecidas fazem fallback para o Dashboard.

## Acompanhamento de Progresso

Abra uma Issue no GitHub com a tag `eds-migration` para cada sprint de migração de tela. Referencie este documento na descrição da issue.

## Definição de Pronto por Tela

Uma tela é considerada migrada quando:
1. Todos os dados são carregados pelas mesmas queries GraphQL do Twenty
2. Todas as ações CRUD funcionam
3. O componente usa apenas design tokens do Erencio.com Backoffice
4. Acessibilidade: navegável por teclado, atributos ARIA corretos
5. Responsivo: funciona em tablet (768px) e desktop (1280px+)
6. Adicionado ao AppRouter com o caminho correto
7. Documentado em BACKOFFICE-COMPONENTS.md se novos componentes foram criados
