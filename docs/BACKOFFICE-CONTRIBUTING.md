# Erencio.com Backoffice Frontend — Guia de Contribuição

Este guia cobre como contribuir para o pacote frontend Erencio.com Backoffice (`packages/erencio-front`).

## Primeiros Passos

```bash
# Na raiz do repositório
yarn install

# Iniciar apenas o frontend Erencio.com Backoffice (porta 3002)
npx nx start erencio-front

# O backend deve estar rodando separadamente:
npx nx start twenty-server   # porta 3000
```

> O servidor de desenvolvimento Vite faz proxy de `/api` para `http://localhost:3000`, então não é necessário configurar CORS.

## Estrutura do Pacote

```
packages/erencio-front/
├── index.html              # HTML de entrada
├── vite.config.ts          # Config Vite (porta 3002, proxy da API)
├── tsconfig.json           # Configuração TypeScript
├── package.json
└── src/
    ├── main.tsx            # Ponto de entrada ReactDOM
    ├── App.tsx             # Componente raiz (AuthProvider + AppRouter)
    ├── AppRouter.tsx       # Roteamento baseado em hash (login, dashboard, settings)
    ├── global.css          # CSS custom properties (--backoffice-g-*) + reset
    ├── utilities.css       # Classes utilitárias estilo SLDS 2 (.eds-*)
    ├── tokens/             # Design tokens
    │   └── tokens.ts       # Cor, tipografia, espaçamento, borda, elevação, z-index
    ├── components/         # Componentes primitivos de UI
    │   ├── Button/
    │   ├── Input/
    │   ├── Card/
    │   ├── Badge/
    │   └── Layout/         # Shell (app shell com topbar + sidebar)
    ├── hooks/
    │   └── useAuth.tsx     # Contexto de autenticação + gerenciamento JWT
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── DashboardPage.tsx
    │   └── ProfileSettingsPage.tsx
    └── utils/
        └── api.ts          # Cliente GraphQL mínimo
```

## Adicionar um Novo Componente

1. Crie `src/components/<NomeDoComponente>/<NomeDoComponente>.tsx`
2. Exporte o componente e tipos com named exports
3. Crie `src/components/<NomeDoComponente>/index.ts` (barrel export)
4. Adicione em `src/components/index.ts`
5. Documente em `docs/BACKOFFICE-COMPONENTS.md`

### Template de Componente

```tsx
import React from 'react';
import { tokens } from '@eds/tokens';

export type MeuComponenteProps = {
  label: string;
  // ... outras props
};

export const MeuComponente = ({ label }: MeuComponenteProps) => {
  const style: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamilyBase,
    color: tokens.color.textDefault,
    // ... estilos a partir dos tokens
  };

  return <div style={style}>{label}</div>;
};
```

## Adicionar uma Nova Página

1. Crie `src/pages/<NomeDaPagina>Page.tsx`
2. Adicione uma rota em `src/AppRouter.tsx`
3. Adicione um item na sidebar em `src/App.tsx` (dentro de `ProtectedLayout`)

## Uso de Design Tokens

Sempre use tokens via `useTheme()` (quando o `erencio-edf` estiver integrado) ou pelas CSS custom properties `--edf-*` — nunca valores hárdcoded:

```tsx
// ✅ Correto (CSS custom property do perfil ativo)
backgroundColor: 'var(--edf-color-brand-primary)'

// ✅ Correto (tokens diretos, enquanto erencio-edf ainda não está integrado)
import { tokens } from '@backoffice/tokens';
backgroundColor: tokens.color.brandPrimary

// ❌ Errado
backgroundColor: '#0176d3'
```

## Slots EDF e useComponent()

Componentes que devem ser substituíveis por perfis EDF não devem ser instanciados diretamente. Use `useComponent()` com o nome do slot:

```tsx
import { useComponent } from 'erencio-edf/core/registry';

export const RecordListPage = () => {
  const RecordList    = useComponent('record.list.container');
  const RecordListRow = useComponent('record.list.row');
  return <RecordList rowComponent={RecordListRow} />;
};
```

Se o perfil ativo não implementar o slot, o componente padrão do `erencio-default` é usado automaticamente.

Veja [EDF.md](./EDF.md) para a lista completa de slots e como criar componentes de perfil.

## Chamadas de API

Use o cliente GraphQL de `@eds/utils/api`:

```tsx
import { gql } from '@eds/utils/api';

const result = await gql<{ myQuery: MyType }>(
  `query MyQuery { myQuery { id name } }`,
  { variables: 'here' }
);
```

O `authToken` é definido automaticamente após o login via `setAuthToken()`.

## Estilo de Código

- Apenas named exports (sem default exports)
- Types ao invés de interfaces (exceto para estender interfaces de terceiros)
- Sem `any` — TypeScript estrito
- Estilos inline usando `React.CSSProperties` + tokens
- Sem Emotion (manter zero dependências CSS-in-JS neste pacote)
- Usar CSS custom properties `--backoffice-g-*` para todos os valores visuais
- Classes CSS utilitárias de `utilities.css` disponíveis para helpers de layout
- Nomes de arquivo: PascalCase para componentes, camelCase para utilitários e hooks

## Testes

```bash
# Rodar testes relacionados ao Erencio.com Backoffice
cd packages/twenty-front && npx jest "useFrontendShell"
```

A principal cobertura de testes para a lógica de seleção de frontend está no pacote `twenty-front`:
`src/modules/workspace/hooks/__tests__/useFrontendShell.test.ts`

## Deploy

O output do build do Erencio.com Backoffice vai para `packages/erencio-front/dist`. Para servi-lo junto ao frontend Twenty principal:

1. Build: `npx nx build erencio-front`
2. Sirva a pasta `dist/` em `/eds` no seu proxy reverso (Nginx/Caddy/Cloudflare)

Exemplo de configuração Nginx:

```nginx
location /eds {
  alias /app/packages/erencio-front/dist;
  try_files $uri $uri/ /backoffice/index.html;
}

location / {
  alias /app/packages/twenty-front/build;
  try_files $uri $uri/ /index.html;
}
```
