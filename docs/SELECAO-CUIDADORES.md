# Seleção de Cuidadores — Guia do Pacote

Pacote `twenty-selecao-cuidadores`: aplicativo público (sem login) que permite a candidatos cadastrarem seus dados para processos de seleção de cuidadores.

## Visão Geral

| Item | Valor |
|------|-------|
| **Pacote** | `packages/twenty-selecao-cuidadores` |
| **Porta dev** | 3003 |
| **Base URL** | `/selecaoCuidadores/` |
| **URL de produção** | `{workspace}.backoffice.erencio.com/selecaoCuidadores` |
| **Autenticação** | Pública — usa API Key do workspace (sem login de visitante) |
| **Identidade visual** | EDS 1.0 (mesmos tokens CSS do `twenty-eds`) |

## Arquitetura

```
packages/twenty-selecao-cuidadores/
├── index.html                       # Ponto de entrada HTML
├── package.json                     # Dependências
├── project.json                     # Configuração Nx
├── tsconfig.json                    # TypeScript (alias @selecao/*)
├── tsconfig.node.json               # TypeScript para Vite
├── vite.config.ts                   # Build e dev server (porta 3003)
└── src/
    ├── main.tsx                     # Bootstrap React
    ├── App.tsx                      # Router (hash-based)
    ├── global.css                   # Tokens EDS (CSS custom properties)
    ├── css-modules.d.ts             # Tipos para CSS modules
    ├── vite-env.d.ts                # Tipos Vite
    ├── components/
    │   ├── PublicLayout.tsx          # Shell: header + footer público
    │   ├── PublicLayout.module.css
    │   ├── FormField.tsx            # Campo de formulário reutilizável
    │   └── FormField.module.css
    ├── pages/
    │   ├── CandidaturaPage.tsx      # Formulário de cadastro (People)
    │   ├── CandidaturaPage.module.css
    │   ├── ConfirmacaoPage.tsx      # Tela de confirmação pós-envio
    │   └── ConfirmacaoPage.module.css
    └── utils/
        └── api.ts                   # Cliente REST para criar registros People
```

## Passo a Passo: Como o Pacote Foi Criado

Este guia serve de referência para criar novos pacotes públicos no futuro.

### 1. Estrutura do pacote

1. Crie a pasta `packages/twenty-selecao-cuidadores/`.
2. Crie `package.json` com `react`, `react-dom`, `react-router-dom` como dependências e `vite`, `typescript`, `@vitejs/plugin-react` como devDependencies.
3. Crie `project.json` registrando o projeto no Nx com targets `build` e `start` (porta 3003).
4. Crie `tsconfig.json` com path alias `@selecao/*` → `src/*`.
5. Crie `tsconfig.node.json` para o Vite.
6. Crie `vite.config.ts` com `base: '/selecaoCuidadores/'` e proxy para `/api`, `/metadata` e `/graphql` apontando para o backend (porta 3000).
7. Crie `index.html` com `lang="pt-BR"` e título em português.

### 2. Registro no workspace

Adicione `"packages/twenty-selecao-cuidadores"` no array `workspaces.packages` do `package.json` raiz do monorepo.

### 3. Design System (identidade visual)

O `global.css` replica os tokens CSS do `twenty-eds` (variáveis `--eds-g-*`). Isso garante que cores, tipografia, espaçamento, bordas e sombras sejam consistentes entre os dois aplicativos.

Componentes usam **CSS Modules** (`.module.css`) para escopo local de estilos.

### 4. Layout público (sem autenticação)

Diferente do `twenty-eds`, este app **não requer login**:
- Não há `AuthProvider`, `ProtectedLayout` nem qualquer verificação de sessão de usuário.
- O `PublicLayout` fornece header e footer simples, envolvendo as páginas via `<Outlet />`.
- O roteamento usa `createHashRouter` do React Router.

### 5. Comunicação com o backend

O app usa a **REST API** do Twenty server com uma **API Key** para autenticação:

- A API Key é configurada via variável de ambiente `VITE_API_KEY`.
- Cada workspace possui sua própria API Key, que deve ser gerada em **Settings > Developers > API Keys** no Twenty/EDS.
- A chamada `POST /api/rest/people` cria um registro People no workspace correspondente.

**Variáveis de ambiente** (arquivo `.env` ou configuração de deploy):

```env
VITE_API_URL=https://{workspace}.backoffice.erencio.com
VITE_API_KEY=eyJhbG...  # API Key do workspace
```

### 6. Formulário de candidatura

A `CandidaturaPage` contém um formulário que captura:

| Campo | Obrigatório | Campo no People |
|-------|:-----------:|-----------------|
| Nome | Sim | `name.firstName` |
| Sobrenome | Sim | `name.lastName` |
| E-mail | Sim | `emails.primaryEmail` |
| DDI | Não | `phones.primaryPhoneCountryCode` |
| Telefone | Sim | `phones.primaryPhoneNumber` |
| Cargo/Função | Não | `jobTitle` |
| Cidade | Não | `city` |

Ao clicar em **"Submeter candidatura"**, os dados são validados localmente e enviados via REST API. Sucesso redireciona para `/confirmacao`.

### 7. Deploy e proxy reverso

Em produção, o Nginx (ou proxy reverso) deve rotear `{workspace}.backoffice.erencio.com/selecaoCuidadores` para o build estático deste pacote:

```nginx
location /selecaoCuidadores/ {
    alias /app/packages/twenty-selecao-cuidadores/dist/;
    try_files $uri $uri/ /selecaoCuidadores/index.html;
}
```

O backend (`/api/rest/*`, `/metadata`, `/graphql`) já é servido pelo Twenty server na mesma origem.

## Comandos

```bash
# Desenvolvimento
npx nx start twenty-selecao-cuidadores   # Dev server na porta 3003

# Build
npx nx build twenty-selecao-cuidadores   # Gera dist/

# Preview
cd packages/twenty-selecao-cuidadores && npx vite preview
```

## Criando uma API Key para o Workspace

1. Acesse o Twenty/EDS como administrador do workspace.
2. Vá em **Settings > Developers > API Keys**.
3. Clique em **Create API Key**.
4. Copie o token gerado.
5. Configure `VITE_API_KEY` com esse token no ambiente de deploy do app público.

> **Segurança**: A API Key controla quais operações o app público pode fazer. Considere criar uma API Key com permissões restritas (somente escrita em People) quando o Twenty suportar permissões granulares por API Key.

## Próximos Passos

- [ ] Adicionar campos adicionais ao formulário conforme necessidade do processo seletivo
- [ ] Implementar upload de currículo (campo `attachments` do People)
- [ ] Adicionar CAPTCHA ou rate limiting para prevenir abuso
- [ ] Criar página de acompanhamento do status da candidatura
- [ ] Internacionalização (i18n) se necessário para outros idiomas
