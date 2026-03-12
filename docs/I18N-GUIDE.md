# Guia de Internacionalização (i18n) — Lingui v5

Guia passo-a-passo para criar páginas no `twenty-front` com suporte correto a traduções usando **Lingui v5** + **@lingui/swc-plugin**.

---

## Visão geral do sistema

| Conceito | Descrição |
|----------|-----------|
| **Macro `t`** | Tagged template literal para strings em props e variáveis. Gera um hash único (6 chars, SHA-256+base64) em build-time. |
| **Componente `<Trans>`** | Componente JSX para marcar texto renderizado diretamente no DOM. |
| **`plural()`** | Função para pluralização sensível ao locale. |
| **Catálogos `.po`** | Arquivos-fonte em `packages/twenty-front/src/locales/{locale}.po` (32 locales). |
| **Catálogos compilados `.ts`** | Arquivos gerados em `packages/twenty-front/src/locales/generated/{locale}.ts` (31 locales). São estes que o runtime lê. |
| **SWC plugin** | Transforma as macros em chamadas `i18n._({id: "hash"})` no build. O texto original **não** é preservado como fallback — se o hash não existir no catálogo compilado, aparece o código hash bruto (ex: `GfnKOF`). |

---

## Passo 1 — Criar o componente da página

Crie o arquivo do componente seguindo as convenções do projeto (named exports, functional components, Emotion para styling):

```
packages/twenty-front/src/pages/settings/minha-feature/
└── components/
    └── SettingsMinhaFeature.tsx
```

```tsx
// SettingsMinhaFeature.tsx
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsMinhaFeature = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`My Feature`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: <Trans>My Feature</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Section Title`}
            description={t`A brief description of this section`}
          />
          {/* Conteúdo da seção aqui */}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
```

---

## Passo 2 — Marcar textos para tradução

### 2.1 — Macro `t` (para props de tipo string)

Use `t` sempre que o texto vai para uma **prop** que espera `string` (não JSX):

```tsx
import { useLingui } from '@lingui/react/macro';

export const MeuComponente = () => {
  const { t } = useLingui();

  return (
    <div>
      {/* Props que recebem string */}
      <H2Title
        title={t`Interface`}
        description={t`Choose which frontend interface to use`}
      />

      <Select
        label={t`Frontend Interface`}
        options={[
          { value: 'A', label: t`Standard (Twenty)` },
          { value: 'B', label: t`Erencio.com Backoffice` },
        ]}
      />

      <Info
        text={t`Your administrator has set a fixed value.`}
      />
    </div>
  );
};
```

> **Importante:** `t` é desestruturado de `useLingui()`, **não** importado diretamente de `@lingui/core/macro` no frontend. O import correto no `twenty-front` é:
> ```tsx
> import { useLingui } from '@lingui/react/macro';
> // Dentro do componente:
> const { t } = useLingui();
> ```

### 2.2 — Componente `<Trans>` (para conteúdo JSX)

Use `<Trans>` quando o texto aparece diretamente como **children** de um elemento ou componente:

```tsx
import { Trans } from '@lingui/react/macro';

// Texto simples
<span><Trans>Save</Trans></span>

// Texto com variáveis
<p><Trans>Added {beautifiedDate}</Trans></p>

// Em breadcrumbs, links, botões
<a href="/settings">
  <Trans>Back to Settings</Trans>
</a>
```

### 2.3 — `plural()` (para pluralização)

Use `plural` para textos que variam conforme quantidade:

```tsx
import { plural } from '@lingui/core/macro';

const label = plural(count, {
  one: `${count} advanced rule`,
  other: `${count} advanced rules`,
});
```

### 2.4 — Quando usar qual

| Situação | Usar | Exemplo |
|----------|------|---------|
| Prop `title`, `label`, `placeholder`, `text` | `t\`...\`` | `title={t\`My Title\`}` |
| Children de JSX | `<Trans>` | `<span><Trans>Hello</Trans></span>` |
| String com plural | `plural()` | `plural(n, { one: '# item', other: '# items' })` |
| String fora de componente React | `t` de `@lingui/core/macro` | Raro no frontend, mais comum no `twenty-server` |

---

## Passo 3 — Extrair mensagens para os catálogos `.po`

Após adicionar as marcações `t` e `<Trans>`, execute o comando de extração:

```bash
npx nx run twenty-front:lingui:extract
```

Este comando:
1. Varre todos os arquivos `src/**` do `twenty-front`
2. Computa o hash SHA-256+base64 (6 chars) para cada mensagem
3. Adiciona entradas novas aos 32 arquivos `.po` em `src/locales/{locale}.po`
4. Remove entradas órfãs (mensagens que não existem mais no código) graças ao flag `--clean`

### O que aparece no `.po`

Para cada mensagem marcada, o extrator gera um bloco como:

```po
#. js-lingui-id: GfnKOF
#: src/pages/settings/profile/appearance/components/SettingsExperience.tsx
msgid "Interface"
msgstr ""
```

- `js-lingui-id` — hash único gerado pelo Lingui
- `#:` — referência ao arquivo-fonte
- `msgid` — texto original (em inglês)
- `msgstr` — tradução (vazio após extração, preenchido pelo tradutor)

Para o locale `en`, o `msgstr` é automaticamente igual ao `msgid`.

---

## Passo 4 — Traduzir

Abra o arquivo `.po` do locale desejado e preencha o `msgstr`:

```po
# Arquivo: src/locales/pt-BR.po
#. js-lingui-id: GfnKOF
#: src/pages/settings/profile/appearance/components/SettingsExperience.tsx
msgid "Interface"
msgstr "Interface"

#. js-lingui-id: gz9POV
#: src/pages/settings/profile/appearance/components/SettingsExperience.tsx
msgid "Choose which frontend interface to use"
msgstr "Escolha qual interface frontend utilizar"
```

> **Dica:** Para desenvolvimento rápido, focque no `en.po` (o `msgstr` deve ser igual ao `msgid`). Traduções podem ser adicionadas incrementalmente depois.

---

## Passo 5 — Compilar os catálogos

Após traduzir, compile os `.po` para os `.ts` que o runtime utiliza:

```bash
npx nx run twenty-front:lingui:compile
```

Este comando gera/atualiza os arquivos TypeScript em `src/locales/generated/{locale}.ts`. Cada arquivo é um JSON compactado numa única linha com o formato:

```ts
export const messages = JSON.parse('{"hashId":["texto traduzido"],... }') as Messages;
```

---

## Passo 6 — Verificar

### 6.1 — Verifique se as entradas existem nos catálogos compilados

```bash
# Procure pelo hash da sua mensagem nos arquivos gerados
grep "GfnKOF" packages/twenty-front/src/locales/generated/en.ts
```

### 6.2 — Inicie o frontend e teste

```bash
npx nx start twenty-front
```

Navegue até a página criada e confirme que os textos aparecem corretamente no idioma selecionado, **sem códigos hash**.

### 6.3 — Rode o lint

```bash
npx nx lint:diff-with-main twenty-front
```

O plugin `eslint-plugin-lingui` valida o uso correto das macros.

---

## Fluxo completo resumido

```
1. Escrever componente com t`...` e <Trans>...</Trans>
       │
       ▼
2. npx nx run twenty-front:lingui:extract
       │  (gera/atualiza 32 arquivos .po)
       ▼
3. Preencher msgstr nos .po dos locales desejados
       │
       ▼
4. npx nx run twenty-front:lingui:compile
       │  (gera/atualiza 31 arquivos .ts em generated/)
       ▼
5. Testar no navegador
       │
       ▼
6. Commit de TODOS os arquivos alterados:
   - Componente .tsx
   - Todos os .po modificados
   - Todos os .ts em generated/
```

---

## Erros comuns e como evitar

### Hash bruto aparece na tela (ex: `GfnKOF`)

**Causa:** A mensagem existe no código-fonte mas não no catálogo compilado `.ts`.

**Solução:**
```bash
npx nx run twenty-front:lingui:extract
npx nx run twenty-front:lingui:compile
```

### `msgstr` vazio nos `.po`

**Causa:** A extração cria entradas com `msgstr ""` para locales não-inglês.

**Solução:** Traduzir ou copiar o texto inglês como fallback temporário. Se `msgstr` estiver vazio, o compilador pode usar o `msgid` como fallback (depende da config de `fallbackLocales`).

### Import errado da macro `t`

**Errado** (no `twenty-front`):
```tsx
import { t } from '@lingui/core/macro'; // Não usar no frontend!
```

**Correto:**
```tsx
import { useLingui } from '@lingui/react/macro';

const { t } = useLingui(); // Dentro do componente
```

> No `twenty-server`, usa-se `import { t, msg } from '@lingui/core/macro'` porque não há React.

### Esquecer de comitar os arquivos gerados

Os arquivos em `src/locales/generated/*.ts` **devem** ser comitados. Eles são o que o runtime lê. Se não forem comitados, o deploy vai mostrar hashes brutos.

---

## Referência rápida de imports

```tsx
// Para t`` e <Trans> no twenty-front (React)
import { Trans, useLingui } from '@lingui/react/macro';

// Para plural() no twenty-front
import { plural } from '@lingui/core/macro';

// Dentro do componente funcional
const { t } = useLingui();
```

---

## Estrutura de arquivos i18n

```
packages/twenty-front/
├── lingui.config.ts                    # Configuração do Lingui
├── src/
│   └── locales/
│       ├── en.po                       # Catálogo fonte — Inglês
│       ├── pt-BR.po                    # Catálogo fonte — Português (Brasil)
│       ├── es-ES.po                    # Catálogo fonte — Espanhol
│       ├── fr-FR.po                    # ... (32 locales)
│       └── generated/
│           ├── en.ts                   # Catálogo compilado — Inglês
│           ├── pt-BR.ts               # Catálogo compilado — Português
│           ├── es-ES.ts               # ... (31 locales)
│           └── ...
```

---

## Configuração (referência)

O arquivo `lingui.config.ts` na raiz do `twenty-front`:

```ts
import { defineConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

export default defineConfig({
  sourceLocale: SOURCE_LOCALE,           // 'en'
  locales: Object.values(APP_LOCALES),   // 32 locales
  pseudoLocale: 'pseudo-en',
  fallbackLocales: {
    'pseudo-en': 'en',
    default: SOURCE_LOCALE,
  },
  catalogs: [{
    path: '<rootDir>/src/locales/{locale}',
    include: ['src'],
  }],
  catalogsMergePath: '<rootDir>/src/locales/generated/{locale}',
  compileNamespace: 'ts',
  format: formatter({ lineNumbers: false, printLinguiId: true }),
});
```

| Campo | Função |
|-------|--------|
| `sourceLocale` | Locale de referência (inglês) |
| `compileNamespace: 'ts'` | Gera `.ts` ao invés de `.js` |
| `printLinguiId: true` | Inclui `js-lingui-id` nos comentários dos `.po` |
| `catalogsMergePath` | Onde os catálogos compilados são escritos |
