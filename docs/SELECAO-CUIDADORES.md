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
├── index.html                             # Ponto de entrada HTML (com runtime config)
├── package.json                           # Dependências
├── project.json                           # Configuração Nx
├── tsconfig.json                          # TypeScript (alias @selecao/*)
├── tsconfig.node.json                     # TypeScript para Vite
├── vite.config.ts                         # Build e dev server (porta 3003)
└── src/
    ├── main.tsx                           # Bootstrap React
    ├── App.tsx                            # Router (hash-based)
    ├── global.css                         # Tokens EDS + utilitários globais
    ├── css-modules.d.ts                   # Tipos para CSS modules
    ├── vite-env.d.ts                      # Tipos Vite
    ├── types/
    │   └── candidatura.ts                 # Tipos e valores iniciais do formulário
    ├── components/
    │   ├── PublicLayout.tsx               # Shell: header + footer público
    │   ├── PublicLayout.module.css
    │   ├── FormField.tsx                  # Campo reutilizável (input, textarea, select via children)
    │   ├── FormField.module.css
    │   ├── StepIndicator.tsx              # Indicador de progresso (4 etapas)
    │   └── StepIndicator.module.css
    ├── steps/
    │   ├── Step1Identificacao.tsx         # Etapa 1: dados pessoais + endereço com CEP auto-fill
    │   ├── Step1Identificacao.module.css
    │   ├── Step2Experiencia.tsx           # Etapa 2: experiência, disponibilidade, curso
    │   ├── Step2Experiencia.module.css
    │   ├── Step3Questionario.tsx          # Etapa 3: 10 Q&A + 3 questões dissertativas
    │   ├── Step3Questionario.module.css
    │   ├── Step4Finalizacao.tsx           # Etapa 4: declarações e botão de envio
    │   └── Step4Finalizacao.module.css
    ├── pages/
    │   ├── ProcessoSeletivoPage.tsx       # Orquestrador do formulário multietapa (rota /)
    │   ├── ProcessoSeletivoPage.module.css
    │   ├── ConfirmacaoPage.tsx            # Confirmação pós-envio
    │   └── ConfirmacaoPage.module.css
    └── utils/
        ├── api.ts                         # createCandidatura() → People + CandidaturaCuidador
        ├── masks.ts                       # Máscaras CPF, CEP, telefone
        └── cep.ts                         # Lookup viaCEP

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

**Configuração da API Key** — o mecanismo principal é via variável de ambiente Docker:

1. Crie uma API Key no workspace (Settings > Developers > API Keys)
2. Adicione `SELECAO_CUIDADORES_API_KEY=eyJhbG...` no `.env` do Docker
3. O `entrypoint.sh` injeta a key no `config.js` do build via `sed`

**Como funciona**:

- O Vite copia `public/config.js` para `dist/config.js` durante o build
- O arquivo contém o placeholder `__SELECAO_API_KEY__`
- No startup do container, `entrypoint.sh` substitui o placeholder pelo valor de `SELECAO_CUIDADORES_API_KEY`
- O `index.html` carrega `config.js` antes do app, definindo `window.__SELECAO_CONFIG__`
- O `api.ts` lê `window.__SELECAO_CONFIG__.apiKey` em runtime

Isso permite usar o **mesmo build** para prod e dev — cada ambiente apenas define sua própria API Key no `.env`.

> **Nota**: As chamadas REST usam URLs relativas (`/rest/people`), funcionam em qualquer domínio sem configuração de URL.

### 8. Formulário de candidatura multietapa

O `ProcessoSeletivoPage` exibe um formulário com 4 etapas:

| Etapa | Título | Descrição |
|-------|--------|-----------|
| 1 | Identificação | Nome, nascimento, gênero, CPF, RG, celular, e-mail, endereço completo com CEP auto-fill via viaCEP |
| 2 | Experiência | Descrição de experiência, disponibilidade (dias+turnos), referências, curso com certificado (campos condicionais) |
| 3 | Questionário | 10 questões de múltipla escolha + 3 questões dissertativas |
| 4 | Finalização | Declaração de veracidade + aceite de comunicações |

Ao finalizar, são criados dois registros:

**People** (identificação básica):

| Campo do formulário | Campo no People |
|---------------------|-----------------|
| Nome completo | `name.firstName` + `name.lastName` (split automático) |
| E-mail | `emails.primaryEmail` |
| Celular | `phones.primaryPhoneNumber` (DDI +55) |
| Município | `city` |

**CandidaturaCuidador** (todos os dados da candidatura — precisa ser criado no workspace, veja seção abaixo):

Campos: `nomeCompleto`, `dataNascimento`, `genero`, `cpf`, `rg`, `celular`, `email`, `logradouro`, `numero`, `complemento`, `cep`, `bairro`, `municipio`, `estado`, `experiencia`, `disponibilidadeDias`, `disponibilidadeTurnos`, `referencias`, `possuiCurso`, `instituicaoCurso`, `cargaHoraria`, `conclusaoCurso`, `respostaQ1`–`respostaQ10`, `questaoAberta11`, `questaoAberta12`, `questaoAberta13`, `aceitaComunicacoes`, `status`, relação `pessoas` → People.

## Configuração do Objeto CandidaturaCuidador no Workspace

O objeto customizado `CandidaturaCuidador` precisa ser criado **uma única vez** em cada workspace onde o formulário for usado.

### 1. Via Settings do Twenty

1. Acesse o Twenty como **administrador do workspace**
2. Vá em **Settings → Data Model → Objects**
3. Clique em **+ Add Custom Object**
4. Configure:
   - **Singular**: `Candidatura Cuidador`
   - **Plural**: `Candidaturas Cuidadores`
5. Adicione os campos abaixo:

### 2. Campos a criar

| Campo (API name) | Tipo | Obrigatório |
|------------------|------|-------------|
| `nomeCompleto` | TEXT | Sim |
| `dataNascimento` | DATE | Não |
| `genero` | TEXT | Não |
| `cpf` | TEXT | Não |
| `rg` | TEXT | Não |
| `celular` | TEXT | Não |
| `email` | TEXT | Não |
| `logradouro` | TEXT | Não |
| `numero` | TEXT | Não |
| `complemento` | TEXT | Não |
| `cep` | TEXT | Não |
| `bairro` | TEXT | Não |
| `municipio` | TEXT | Não |
| `estado` | TEXT | Não |
| `experiencia` | TEXT | Não |
| `disponibilidadeDias` | TEXT | Não |
| `disponibilidadeTurnos` | TEXT | Não |
| `referencias` | TEXT | Não |
| `possuiCurso` | BOOLEAN | Não |
| `instituicaoCurso` | TEXT | Não |
| `cargaHoraria` | NUMBER | Não |
| `conclusaoCurso` | DATE | Não |
| `respostaQ1` – `respostaQ10` | TEXT (10 campos) | Não |
| `questaoAberta11` | TEXT | Não |
| `questaoAberta12` | TEXT | Não |
| `questaoAberta13` | TEXT | Não |
| `aceitaComunicacoes` | BOOLEAN | Não |
| `status` | SELECT | Sim |
| `pessoas` | RELATION → People | Não |

### 3. Status (campo SELECT)

Valores a configurar no campo `status`:

| Valor (API) | Rótulo | Cor sugerida |
|-------------|--------|--------------|
| `AGUARDANDO_ANALISE` | Aguardando análise | 🟡 Amarelo |
| `AGUARDANDO_ENTREVISTA` | Aguardando entrevista | 🔵 Azul |
| `AGUARDANDO_DOCUMENTOS` | Aguardando documentos | 🟠 Laranja |
| `ATIVO` | Ativo | 🟢 Verde |
| `INATIVO` | Inativo | ⚫ Cinza |
| `INAPTO` | Inapto | 🔴 Vermelho |

### 4. Degradação graciosa

Se o objeto `candidaturasCuidadores` não existir no workspace (endpoint retorna 404), o sistema **ainda cria o registro People** e navega para a confirmação. Um aviso é registrado no console. Isso garante que o formulário funcione mesmo antes de o objeto ser criado.

## Comandos

```bash
# Desenvolvimento
npx nx start twenty-selecao-cuidadores   # Dev server na porta 3003

# Build
npx nx build twenty-selecao-cuidadores   # Gera dist/

# Preview
cd packages/twenty-selecao-cuidadores && npx vite preview
```

## Criando e Configurando a API Key

### 1. Criar a API Key no workspace

1. Acesse o Twenty/EDS como administrador do workspace
2. Vá em **Settings > Developers > API Keys**
3. Clique em **Create API Key**
4. Copie o token JWT gerado

### 2. Configurar no ambiente Docker

Adicione no arquivo `.env` do container Docker (ex: `/opt/backoffice/.env`):

```env
SELECAO_CUIDADORES_API_KEY=eyJhbGciOiJIUzI1NiIs...
```

Reinicie o container:

```bash
docker compose down && docker compose up -d
```

O entrypoint injeta automaticamente a key no `config.js` do app.

### 3. Para desenvolvimento local

Crie um `.env` na raiz do pacote `packages/twenty-selecao-cuidadores/`:

```env
VITE_API_KEY=eyJhbGciOiJIUzI1NiIs...
```

Ou edite `public/config.js` diretamente (não commitar o token!).

> **Segurança**: A API Key controla quais operações o app público pode fazer. Considere criar uma API Key com permissões restritas (somente escrita em People) quando o Twenty suportar permissões granulares por API Key.

## Ambientes

| Ambiente | Domínio | URL completa |
|----------|---------|--------------|
| Produção | `backoffice.erencio.com` | `backoffice.erencio.com/selecaoCuidadores` |
| Desenvolvimento | `backoffice--dev.erencio.com` | `backoffice--dev.erencio.com/selecaoCuidadores` |
| Local | `localhost:3003` | `localhost:3003/selecaoCuidadores/` |

O mesmo build Docker serve ambos os ambientes (prod e dev). A diferença é a API Key configurada em cada workspace.

## Próximos Passos

- [x] Formulário multietapa completo (4 etapas)
- [x] Auto-fill de endereço via viaCEP
- [x] Criação de People + CandidaturaCuidador via REST API
- [x] Indicador de progresso (StepIndicator)
- [ ] Criar objeto `CandidaturaCuidador` no workspace (ver seção acima)
- [ ] Implementar upload de currículo / foto
- [ ] Adicionar CAPTCHA ou rate limiting para prevenir abuso
- [ ] Página de acompanhamento do status da candidatura
- [ ] Internacionalização (i18n) se necessário
