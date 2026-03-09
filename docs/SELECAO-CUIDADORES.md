# Seleção de Cuidadores — Guia do Pacote

Pacote `twenty-selecao-cuidadores`: aplicativo público (sem login) que permite a candidatos cadastrarem seus dados para processos de seleção de cuidadores.

## Visão Geral

| Item | Valor |
|------|-------|
| **Pacote** | `packages/twenty-selecao-cuidadores` |
| **Porta dev** | 3003 |
| **Base URL** | `/selecaoCuidadores/` |
| **URL de produção** | `backoffice.erencio.com/selecaoCuidadores` |
| **URL de desenvolvimento** | `backoffice--dev.erencio.com/selecaoCuidadores` |
| **Autenticação** | Pública — usa API Key do workspace (sem login de visitante) |
| **Identidade visual** | EDS 1.0 (mesmos tokens CSS do `twenty-eds`) |

## Arquitetura

```
packages/twenty-selecao-cuidadores/
├── index.html                       # Ponto de entrada HTML (com runtime config)
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

### Como o app é servido (produção e dev)

O projeto **não usa nginx**. O NestJS serve todos os frontends via `@nestjs/serve-static`:

```
Internet (Cloudflare Tunnel)
    ↓
NestJS Backend (porta 3000)
    ├─ /selecaoCuidadores/*  → dist/selecaoCuidadores/ (este app)
    ├─ /eds/*                → dist/eds/               (twenty-eds)
    ├─ /*                    → dist/front/             (twenty-front)
    ├─ /graphql              → GraphQL API
    ├─ /rest/*               → REST API
    └─ /metadata             → Metadata API
```

Registro feito em `packages/twenty-server/src/app.module.ts`:

```typescript
const selecaoCuidadoresPath = join(__dirname, 'selecaoCuidadores');

if (existsSync(selecaoCuidadoresPath)) {
  modules.push(
    ServeStaticModule.forRoot({
      rootPath: selecaoCuidadoresPath,
      serveRoot: '/selecaoCuidadores',
      exclude: ['/api/*', '/auth/*', '/metadata/*', '/files/*', '/rest/*', '/graphql'],
    }),
  );
}
```

## Passo a Passo: Como o Pacote Foi Criado

Este guia serve de referência para criar novos pacotes públicos no futuro.

### 1. Estrutura do pacote

1. Crie a pasta `packages/twenty-selecao-cuidadores/`.
2. Crie `package.json` com `react`, `react-dom`, `react-router-dom` como dependências e `vite`, `typescript`, `@vitejs/plugin-react` como devDependencies.
3. Crie `project.json` registrando o projeto no Nx com targets `build` e `start` (porta 3003).
4. Crie `tsconfig.json` com path alias `@selecao/*` → `src/*`.
5. Crie `tsconfig.node.json` para o Vite.
6. Crie `vite.config.ts` com `base: '/selecaoCuidadores/'` e proxy para `/rest`, `/metadata` e `/graphql` apontando para o backend (porta 3000).
7. Crie `index.html` com `lang="pt-BR"`, título em português e bloco `<script>` para configuração em runtime.

### 2. Registro no workspace (Yarn)

Adicione `"packages/twenty-selecao-cuidadores"` no array `workspaces.packages` do `package.json` raiz.

### 3. Registro no NestJS (ServeStaticModule)

Em `packages/twenty-server/src/app.module.ts`, no método `getConditionalModules()`, adicione um bloco `ServeStaticModule.forRoot()` com `serveRoot: '/selecaoCuidadores'` **antes** do registro do twenty-front (que é o fallback raiz).

### 4. Registro no Dockerfile

Em `packages/twenty-docker/twenty/Dockerfile`:

1. **common-deps**: Adicione `COPY ./packages/twenty-selecao-cuidadores/package.json /app/packages/twenty-selecao-cuidadores/`
2. **twenty-front-build**: Adicione `COPY ./packages/twenty-selecao-cuidadores /app/packages/twenty-selecao-cuidadores` e inclua `npx nx build twenty-selecao-cuidadores` no `RUN`
3. **twenty (final)**: Adicione `COPY --chown=1000 --from=twenty-front-build /app/packages/twenty-selecao-cuidadores/dist /app/packages/twenty-server/dist/selecaoCuidadores`

### 5. Design System (identidade visual)

O `global.css` replica os tokens CSS do `twenty-eds` (variáveis `--eds-g-*`). Isso garante que cores, tipografia, espaçamento, bordas e sombras sejam consistentes entre os dois aplicativos.

Componentes usam **CSS Modules** (`.module.css`) para escopo local de estilos.

### 6. Layout público (sem autenticação)

Diferente do `twenty-eds`, este app **não requer login**:
- Não há `AuthProvider`, `ProtectedLayout` nem qualquer verificação de sessão de usuário.
- O `PublicLayout` fornece header e footer simples, envolvendo as páginas via `<Outlet />`.
- O roteamento usa `createHashRouter` do React Router.

### 7. Comunicação com o backend

O app usa a **REST API** do Twenty server com uma **API Key** para autenticação.

A chamada `POST /rest/people` cria um registro People no workspace correspondente.

**Configuração da API Key** (duas opções, por prioridade):

#### Opção A: Runtime (recomendado para múltiplos ambientes)

Edite o `window.__SELECAO_CONFIG__` no `index.html` do build:

```html
<script>
  window.__SELECAO_CONFIG__ = {
    apiKey: 'eyJhbG...',  // API Key do workspace
  };
</script>
```

Isso permite usar o **mesmo build** para prod e dev, apenas trocando a config.

#### Opção B: Build time (via variáveis de ambiente)

```env
VITE_API_KEY=eyJhbG...  # Baked no JS bundle
```

> **Nota**: As chamadas REST usam URLs relativas (`/rest/people`), então funcionam em qualquer domínio (prod e dev) sem configuração adicional de URL.

### 8. Formulário de candidatura

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
5. Configure a API Key via `window.__SELECAO_CONFIG__` (runtime) ou `VITE_API_KEY` (build time).

> **Segurança**: A API Key controla quais operações o app público pode fazer. Considere criar uma API Key com permissões restritas (somente escrita em People) quando o Twenty suportar permissões granulares por API Key.

## Ambientes

| Ambiente | Domínio | URL completa |
|----------|---------|--------------|
| Produção | `backoffice.erencio.com` | `backoffice.erencio.com/selecaoCuidadores` |
| Desenvolvimento | `backoffice--dev.erencio.com` | `backoffice--dev.erencio.com/selecaoCuidadores` |
| Local | `localhost:3003` | `localhost:3003/selecaoCuidadores/` |

O mesmo build Docker serve ambos os ambientes (prod e dev). A diferença é a API Key configurada em cada workspace.

## Próximos Passos

- [ ] Adicionar campos adicionais ao formulário conforme necessidade do processo seletivo
- [ ] Implementar upload de currículo (campo `attachments` do People)
- [ ] Adicionar CAPTCHA ou rate limiting para prevenir abuso
- [ ] Criar página de acompanhamento do status da candidatura
- [ ] Internacionalização (i18n) se necessário para outros idiomas
