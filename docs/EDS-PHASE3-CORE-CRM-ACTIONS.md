# EDS Fase 3 — Ações Principais do CRM: Plano de Design e Implementação

Este documento especifica os componentes, comportamentos, tokens e estrutura de página para a Fase 3 da migração EDS (Ações Principais do CRM). Todos os designs seguem os princípios do [SLDS 2](https://www.lightningdesignsystem.com/) adaptados para React, usando design tokens EDS (`--eds-g-*`).

---

## Índice

1. [Escopo](#escopo)
2. [Novos Componentes](#novos-componentes)
   - [FormElement](#formelement)
   - [Textarea](#textarea)
   - [FileSelector](#fileselector)
   - [Combobox](#combobox)
   - [ConfirmDialog](#confirmdialog)
   - [RecordForm](#recordform)
3. [Componentes Atualizados](#componentes-atualizados)
   - [Icon (novos ícones)](#icon-novos-ícones)
   - [InlineEdit (suporte a relacionamentos)](#inlineedit-suporte-a-relacionamentos)
4. [Novos Hooks](#novos-hooks)
   - [useRecordCreate](#userecordcreate)
   - [useRecordDelete](#userecorddelete)
   - [useFileUpload](#usefileupload)
   - [useRelationSearch](#userelationsearch)
5. [Páginas](#páginas)
   - [CreateContactPage](#createcontactpage)
   - [CreateCompanyPage](#createcompanypage)
   - [CreateDealPage](#createdealpage)
6. [Queries e Mutations GraphQL](#queries-e-mutations-graphql)
7. [Alterações de Roteamento](#alterações-de-roteamento)
8. [Adições de Design Tokens](#adições-de-design-tokens)
9. [Checklist de Acessibilidade](#checklist-de-acessibilidade)
10. [Resumo da Estrutura de Arquivos](#resumo-da-estrutura-de-arquivos)
11. [Definição de Pronto](#definição-de-pronto)

---

## Escopo

A Fase 3 entrega as **Ações Principais do CRM** para os três objetos primários (contatos, empresas, oportunidades). Os usuários podem:

- Criar um novo registro via página de formulário dedicada (layout de formulário empilhado)
- Editar um registro existente in-place (clique-para-editar, já via InlineEdit da Fase 2) E via formulário de edição completo
- Excluir um registro com diálogo de confirmação destrutivo
- Definir campos de relacionamento (ex: atribuir uma empresa a um contato) via combobox pesquisável
- Fazer upload de arquivos (anexos) em um registro

Navegação a partir das páginas de lista: um botão "Novo" no `PageHeader` abre o formulário de criação. A partir das páginas de detalhe: "Editar" alterna o modo de formulário completo e "Excluir" aciona o diálogo de confirmação.

---

## Novos Componentes

### FormElement

> Referência SLDS 2: [Form Element](https://www.lightningdesignsystem.com/components/form-element/)

**Arquivo:** `src/components/FormElement/FormElement.tsx`

O wrapper fundamental que fornece estrutura (label, texto de ajuda, mensagem de validação) ao redor de qualquer controle de input. Todos os campos de formulário usam este wrapper.

```tsx
type FormElementLayout = 'stacked' | 'horizontal';

type FormElementProps = {
  id: string;                          // ID único, usado para associação label-input
  label: string;                       // Texto do label do campo
  required?: boolean;                  // Mostra asterisco vermelho, marca campo como obrigatório
  helpText?: string;                   // Texto de ajuda/tooltip exibido via ícone de info
  error?: string;                      // Mensagem de erro de validação (texto vermelho abaixo do input)
  layout?: FormElementLayout;          // 'stacked' (padrão) ou 'horizontal'
  children: React.ReactNode;           // O controle de input (Input, Textarea, Select, etc.)
  className?: string;
  style?: React.CSSProperties;
};
```

**Anatomia (SLDS 2):**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Asterisco Obrigatório | `*` vermelho antes do label quando `required=true` |
| 2 | Label do Campo | `<label>` descrevendo o propósito do input |
| 3 | Ícone de Ajuda | Ícone de info que aciona tooltip com `helpText` |
| 4 | Componente de Input | Elemento filho (o controle real) |
| 5 | Texto de Suporte | Abaixo do input; exibe mensagem de `error` ou texto auxiliar |

**Especificação visual:**
- **Layout empilhado (padrão):** Label fica acima do input; largura total. `marginBottom: spacingMedium` entre elementos de formulário.
- **Layout horizontal:** Label à esquerda (33% largura), controle à direita (67% largura). Itens centralizados verticalmente.
- **Label:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`, `color: textLabel`, `marginBottom: spacingXXSmall` (empilhado) ou inline (horizontal).
- **Asterisco obrigatório:** `color: error`, posicionado antes do texto do label. `aria-hidden="true"` (leitores de tela recebem `aria-required` no input).
- **Estado de erro:** Borda do input fica `borderError`. Mensagem de erro abaixo: `fontSize: fontSizeSmall`, `color: error`, prefixada com ícone de erro. Associada via `aria-describedby`.
- **Ícone de ajuda:** 14px ícone info, `color: textPlaceholder`, hover revela tooltip. `aria-label="Ajuda para {label}"`.

**Comportamentos:**
- Quando `error` é definido, a área de texto de suporte exibe a mensagem com `aria-live="assertive"` para leitores de tela.
- O `<label>` usa `htmlFor={id}` para que clicar no label foque o input.
- Ordem de tabulação segue a ordem natural do documento.

---

### Textarea

> Referência SLDS 2: [Textarea](https://www.lightningdesignsystem.com/components/textarea/)

**Arquivo:** `src/components/Textarea/Textarea.tsx`

Input de texto multi-linhas para descrições, notas e comentários.

```tsx
type TextareaProps = {
  id?: string;
  value: string;
  placeholder?: string;
  label?: string;                      // Se usado standalone (sem wrapper FormElement)
  rows?: number;                       // Padrão: 4
  maxLength?: number;                  // Limite de caracteres opcional
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;                     // Estado visual de erro (borda + ícone)
  resize?: 'none' | 'vertical' | 'both';  // Padrão: 'vertical'
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
};
```

**Especificação visual:**
- `width: 100%`, `minHeight: rows * lineHeight`, padrão `rows: 4`.
- Borda: `1px solid borderInput`, foco: `borderFocus` com `box-shadow: 0 0 0 1px brandPrimary`.
- Erro: borda `borderError`, sem sombra.
- `padding: spacingXSmall spacingSmall`, `borderRadius: radiusMedium`.
- `fontFamily: fontFamilyBase`, `fontSize: fontSizeMedium`, `color: textDefault`.
- Desabilitado: `backgroundColor: neutral1`, `color: textDisabled`, `cursor: not-allowed`.
- Somente leitura: `backgroundColor: transparent`, `border: none`, `padding: 0`.
- Handle de resize: handle nativo do navegador, controlado via prop `resize`.
- Contador de caracteres (quando `maxLength` definido): exibido abaixo alinhado à direita, `fontSize: fontSizeSmall`, `color: textPlaceholder`. Muda para `color: error` quando no/acima do limite.

**Estados:**
1. Padrão — borda cinza, placeholder visível
2. Ativo/Foco — borda azul + anel de foco, placeholder oculto
3. Desabilitado — fundo cinza, sem foco
4. Somente leitura — sem borda, aparência de texto simples
5. Erro — borda vermelha, mensagem de erro abaixo

---

### FileSelector

> Referência SLDS 2: [File Selector](https://www.lightningdesignsystem.com/components/file-selector/)

**Arquivo:** `src/components/FileSelector/FileSelector.tsx`

Upload de arquivos do dispositivo local. Suporta arrastar-e-soltar e clique-para-navegar.

```tsx
type FileSelectorProps = {
  label?: string;                      // Label do campo (ex: "Anexos")
  accept?: string;                     // Filtro de tipo de arquivo (ex: "image/*,.pdf")
  multiple?: boolean;                  // Permitir múltiplos arquivos (padrão: false)
  maxSizeMB?: number;                  // Tamanho máx do arquivo em MB (padrão: 10)
  disabled?: boolean;
  files: File[];                       // Arquivos selecionados atualmente (controlado)
  uploading?: boolean;                 // Mostrar spinner de upload
  error?: string;                      // Mensagem de erro
  onChange: (files: File[]) => void;   // Chamado quando arquivos são selecionados/soltos
  onRemove?: (index: number) => void;  // Chamado quando um arquivo é removido da lista
  'aria-label'?: string;
};
```

**Anatomia (SLDS 2):**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Label do Campo | Descreve o propósito do seletor de arquivo |
| 2 | Zona de Soltar | Área com borda tracejada convidando arrastar-e-soltar |
| 3 | Botão de Upload | Abre o navegador de arquivos |
| 4 | Instruções | Texto auxiliar "Ou arraste arquivos aqui" |
| 5 | Lista de Arquivos | Arquivos selecionados exibidos como pílulas removíveis |
| 6 | Texto de Suporte | Mensagens de erro/validação |

**Especificação visual:**
- **Zona de soltar:** Borda tracejada `2px dashed borderDefault`, `borderRadius: radiusMedium`, `padding: spacingLarge`, conteúdo centralizado.
- **Zona de soltar (hover/drag-over):** `borderColor: brandPrimary`, `backgroundColor: brandPrimaryLight` (azul sutil).
- **Zona de soltar (drag-over erro):** `borderColor: error`, ícone de erro visível.
- **Botão de upload:** Variante outline brand, centralizado na zona de soltar.
- **Instruções:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, abaixo do botão.
- **Lista de arquivos:** Cada arquivo como pílula/chip com nome + tamanho + botão remover (×). `backgroundColor: neutral1`, `borderRadius: radiusPill`, `padding: spacingXXSmall spacingSmall`.
- **Estado de upload:** Spinner substitui o texto do botão, progresso exibido.
- **Desabilitado:** `opacity: 0.5`, `cursor: not-allowed`, zona de soltar não interativa.
- **Erro:** `borderColor: borderError`, mensagem de erro abaixo em vermelho.

**Comportamentos:**
- Clique na zona de soltar ou botão → abre seletor de arquivo nativo.
- Arrastar arquivo sobre a zona → destaque visual (mudança de borda + fundo).
- Soltar arquivos → valida tamanho/tipo, chama `onChange`.
- Arquivos excedendo `maxSizeMB` ou não correspondendo ao `accept` → exibe erro, rejeita arquivo.
- Botão remover em cada pílula de arquivo chama `onRemove(index)`.
- Quando `uploading=true`, exibe spinner dentro da área da zona de soltar.
- `aria-label` no input de arquivo oculto para leitores de tela.

---

### Combobox

> Referência SLDS 2: [Combobox](https://www.lightningdesignsystem.com/components/combobox/)

**Arquivo:** `src/components/Combobox/Combobox.tsx`

Um dropdown com busca usado principalmente para campos de relacionamento (ex: selecionar uma empresa para um contato).

```tsx
type ComboboxOption = {
  id: string;
  label: string;
  sublabel?: string;                   // Linha secundária (ex: nome de domínio)
  avatarUrl?: string;                  // Avatar/ícone opcional
};

type ComboboxProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value: ComboboxOption | null;        // Opção selecionada atualmente
  options: ComboboxOption[];           // Opções disponíveis (pode ter busca em tempo real)
  loading?: boolean;                   // Mostrar spinner no dropdown
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  searchQuery: string;                 // Input de busca controlado
  onSearchChange: (query: string) => void;   // Chamado conforme o usuário digita
  onSelect: (option: ComboboxOption | null) => void;  // Chamado na seleção
  onClear?: () => void;               // Chamado quando a seleção é limpa
  emptyMessage?: string;              // Exibido quando nenhuma opção corresponde
  'aria-label'?: string;
  'aria-describedby'?: string;
};
```

**Anatomia (SLDS 2):**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Input | Input de texto para busca/filtragem |
| 2 | Pílula Selecionada | Exibe a seleção atual como uma pílula (quando valor definido) |
| 3 | Listbox Dropdown | `<ul role="listbox">` mostrando opções filtradas |
| 4 | Opção | `<li role="option">` com label, sublabel e avatar opcional |
| 5 | Botão Limpar | Botão × para remover a seleção atual |
| 6 | Spinner de Carregamento | Exibido dentro do dropdown quando carregando opções |

**Especificação visual:**
- **Input:** Mesmas dimensões do Input padrão (altura 36px, mesmas bordas/radius).
- **Input com seleção:** Exibe label da opção selecionada como texto; botão limpar (×) à direita.
- **Dropdown:** `position: absolute`, `zIndex: zIndexDropdown`, `backgroundColor: neutral0`, `border: 1px solid borderDefault`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `maxHeight: 240px`, `overflowY: auto`.
- **Opção (padrão):** `padding: spacingXSmall spacingSmall`, `fontSize: fontSizeMedium`. Avatar (20px, arredondado) à esquerda se presente.
- **Opção (hover):** `backgroundColor: neutral1`.
- **Opção (focada):** `backgroundColor: brandPrimaryLight`, `outline: none`. Indicado por `aria-activedescendant`.
- **Opção (selecionada):** Ícone de check à direita, `fontWeight: fontWeightMedium`.
- **Estado vazio:** Texto centralizado "Nenhum resultado encontrado", `color: textPlaceholder`, `padding: spacingMedium`.
- **Carregando:** Spinner centralizado no dropdown com texto "Buscando...".

**Comportamentos:**
- Digitar no input chama `onSearchChange` (debounce feito externamente pelo hook).
- Setas para baixo/cima navegam as opções. Enter seleciona a opção destacada. Escape fecha o dropdown.
- Clicar em uma opção seleciona e fecha o dropdown.
- Quando `value` está definido, o input exibe o label em somente leitura. Clicar em limpar (×) reseta.
- Dropdown abre no foco/clique quando nenhum valor está definido.
- `role="combobox"` no input, `aria-expanded`, `aria-controls`, `aria-activedescendant` para acessibilidade.
- `role="listbox"` no dropdown, `role="option"` em cada item.

---

### ConfirmDialog

> Baseado em SLDS 2 [Prompt](https://www.lightningdesignsystem.com/components/prompt/) + [Modal](https://www.lightningdesignsystem.com/components/modals/)

**Arquivo:** `src/components/ConfirmDialog/ConfirmDialog.tsx`

Um modal focado para confirmações destrutivas (excluir registro, descartar alterações).

```tsx
type ConfirmDialogVariant = 'destructive' | 'warning' | 'info';

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;                         // ex: "Excluir Contato"
  message: string | React.ReactNode;     // ex: "Tem certeza que deseja excluir João Silva?"
  confirmLabel?: string;                 // Padrão: "Excluir" / "Confirmar"
  cancelLabel?: string;                  // Padrão: "Cancelar"
  variant?: ConfirmDialogVariant;        // Padrão: 'destructive'
  loading?: boolean;                     // Exibe spinner no botão confirmar
  'aria-label'?: string;
};
```

**Especificação visual:**
- Usa o componente `Modal` existente internamente, `size="small"`.
- **Cabeçalho:** Ícone correspondente à variante (error-icon para destructive, warning para warning, info para info) + texto do título.
- **Cor do ícone:** Destructive → `error`, Warning → `warning`, Info → `brandPrimary`.
- **Corpo:** Texto da mensagem, `fontSize: fontSizeMedium`, `color: textDefault`.
- **Rodapé:** Dois botões — Cancelar (variante neutral) e Confirmar (variante destructive/brand correspondente ao `variant`).
- **Botão confirmar (destructive):** `backgroundColor: error`, `color: textInverse`.
- **Botão confirmar (warning):** `backgroundColor: warning`, `color: textInverse`.
- **Estado de carregamento:** Botão confirmar exibe spinner, estado desabilitado.

**Comportamentos:**
- Construído sobre `Modal` — herda focus trap, Escape para fechar, clique no overlay.
- Botão confirmar recebe foco inicial (para usuários de teclado).
- `onConfirm` chamado quando botão confirmar clicado. `onCancel` chamado em cancelar, Escape ou clique no overlay.
- Leitor de tela: Diálogo anunciado como `role="alertdialog"` com `aria-describedby` apontando para a mensagem.

---

### RecordForm

**Arquivo:** `src/components/RecordForm/RecordForm.tsx`

Um componente de formulário genérico que renderiza um formulário estruturado a partir de definições de campos. Usado tanto para modos de criação quanto de edição.

```tsx
type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'textarea'
  | 'relation'
  | 'file';

type FormFieldDefinition = {
  key: string;                         // Chave do campo (mapeia para caminho do campo GraphQL)
  label: string;                       // Label de exibição
  type: FormFieldType;                 // Tipo de input
  required?: boolean;                  // Campo obrigatório?
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;  // Para tipo 'select'
  // Específico de relacionamento
  relationObjectNameSingular?: string; // ex: 'company'
  relationObjectNamePlural?: string;   // ex: 'companies'
  relationSearchFields?: string[];     // Campos para buscar
  relationDisplayField?: string;       // Campo para exibir como label
  // Específico de arquivo
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  // Layout
  colSpan?: 1 | 2;                    // 1 coluna (50%) ou 2 colunas (100%) no grid de 2 colunas
};

type FormSection = {
  title?: string;                      // Título da seção (opcional)
  columns?: 1 | 2;                     // Número de colunas (padrão: 2)
  fields: FormFieldDefinition[];
};

type RecordFormProps = {
  title: string;                       // Título da página/formulário ("Novo Contato", "Editar Empresa")
  sections: FormSection[];             // Seções do formulário com campos
  values: Record<string, unknown>;     // Valores atuais do formulário
  errors: Record<string, string>;      // Erros por campo
  saving: boolean;                     // Envio do formulário em andamento
  onChange: (field: string, value: unknown) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;                // Padrão: "Salvar"
  cancelLabel?: string;                // Padrão: "Cancelar"
};
```

**Anatomia:**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Cabeçalho do Formulário | Título + botões Cancelar/Salvar |
| 2 | Seção | Título de seção opcional + grid de elementos de formulário |
| 3 | Elemento de Formulário | Campo individual (FormElement + input apropriado) |
| 4 | Rodapé | Barra inferior fixa com botões Cancelar + Salvar |

**Especificação visual:**
- **Cabeçalho do formulário:** Título usa `fontSizeXXLarge`, `fontWeightBold`. Botão Cancelar (ghost) e botão Salvar (brand) alinhados à direita.
- **Título da seção:** `fontSize: fontSizeLarge`, `fontWeight: fontWeightMedium`, `color: textDefault`, `borderBottom: 1px solid borderDefault`, `paddingBottom: spacingXSmall`, `marginBottom: spacingMedium`.
- **Grid de campos:** CSS Grid, 2 colunas com `gap: spacingMedium spacingLarge`. Campos de coluna única ocupam 50%, `colSpan: 2` ocupa 100%.
- **Layout de coluna única:** Cada campo ocupa largura total.
- **Barra de rodapé:** Fixa na parte inferior, `backgroundColor: neutral0`, `borderTop: 1px solid borderDefault`, `padding: spacingMedium spacingLarge`. Botões alinhados à direita.
- **Estado de salvamento:** Botão Salvar desabilitado + spinner.

**Comportamentos:**
- Elemento `<form>` com handler `onSubmit`. Tecla Enter no último campo submete o formulário.
- Cada campo chama `onChange(fieldKey, value)` na alteração.
- Erros de validação mapeados por chave de campo → exibidos no FormElement.
- Campos de relacionamento usam o componente Combobox internamente.
- Campos de arquivo usam o componente FileSelector.
- `aria-busy="true"` no formulário durante salvamento.

---

## Componentes Atualizados

### Icon (novos ícones)

Novos ícones adicionados para a Fase 3:

| Nome do Ícone | Uso |
|---------------|-----|
| `plus` | Botões "Novo registro", ações de adição |
| `trash` | Ações de exclusão |
| `upload` | Botão de upload de arquivo |
| `attachment` | Indicador de anexo de arquivo |
| `link` | Indicador de link de relacionamento |
| `unlink` | Remover relacionamento |
| `drag` | Handle de arraste para zona de soltar |

### InlineEdit (suporte a relacionamentos)

O componente `InlineEdit` existente ganha um novo modo `fieldType: 'relation'` que renderiza um Combobox ao invés de um input de texto. Props adicionais:

```tsx
// Adicionado ao InlineEditProps
relationObjectNameSingular?: string;
relationObjectNamePlural?: string;
relationSearchFields?: string[];
relationDisplayField?: string;
```

Quando `fieldType === 'relation'`, o InlineEdit renderiza um Combobox no modo edição com busca em tempo real de registros relacionados.

---

## Novos Hooks

### useRecordCreate

**Arquivo:** `src/hooks/useRecordCreate.ts`

```tsx
type UseRecordCreateOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

type UseRecordCreateReturn = {
  createRecord: (input: Record<string, unknown>) => Promise<{
    success: boolean;
    recordId?: string;
    error?: string;
  }>;
  loading: boolean;
};
```

Constrói e executa uma mutation `createPerson` / `createCompany` / `createOpportunity` dinamicamente.

Formato da mutation GraphQL:
```graphql
mutation CreatePerson($input: PersonCreateInput!) {
  createPerson(data: $input) {
    id
  }
}
```

### useRecordDelete

**Arquivo:** `src/hooks/useRecordDelete.ts`

```tsx
type UseRecordDeleteOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

type UseRecordDeleteReturn = {
  deleteRecord: (recordId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  loading: boolean;
};
```

Constrói e executa uma mutation `deletePerson` / `deleteCompany` / `deleteOpportunity`.

Formato da mutation GraphQL:
```graphql
mutation DeletePerson($id: ID!) {
  deletePerson(id: $id) {
    id
  }
}
```

### useFileUpload

**Arquivo:** `src/hooks/useFileUpload.ts`

```tsx
type UseFileUploadReturn = {
  uploadFile: (file: File) => Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }>;
  uploading: boolean;
  progress: number;  // 0-100
};
```

O upload de arquivos do Twenty usa um endpoint REST: `POST /files` com `multipart/form-data`. O hook gerencia o ciclo de vida do upload e retorna a URL do anexo.

### useRelationSearch

**Arquivo:** `src/hooks/useRelationSearch.ts`

```tsx
type UseRelationSearchOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
  searchFields: string[];
  displayField: string;
  fields: string;            // Campos GraphQL para buscar
};

type UseRelationSearchReturn = {
  options: Array<{ id: string; label: string; sublabel?: string; avatarUrl?: string }>;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};
```

Reutiliza o padrão `useRecordList` internamente mas retorna resultados formatados como `ComboboxOption[]`. Inclui debounce (300ms) no input de busca.

---

## Páginas

### CreateContactPage

**Arquivo:** `src/pages/CreateContactPage.tsx`

**Rota:** `/contacts/new`

**Seções:**
1. **Informações Pessoais** (2 colunas)
   - Primeiro Nome (text, obrigatório)
   - Último Nome (text, obrigatório)
   - Email (email)
   - Telefone (phone)
   - Cargo (text)
   - Cidade (text)

2. **Organização** (2 colunas)
   - Empresa (relation → `company`, exibe nome da empresa)

**Ao submeter:** Cria pessoa via `useRecordCreate`, exibe toast de sucesso, navega para `/contacts/:id`.
**Ao cancelar:** Navega de volta para `/contacts`.

### CreateCompanyPage

**Arquivo:** `src/pages/CreateCompanyPage.tsx`

**Rota:** `/companies/new`

**Seções:**
1. **Informações da Empresa** (2 colunas)
   - Nome (text, obrigatório)
   - Nome de Domínio (url)
   - Funcionários (number)
   - Endereço (text, colSpan: 2)
   - Perfil de Cliente Ideal (boolean)

**Ao submeter:** Cria empresa via `useRecordCreate`, exibe toast de sucesso, navega para `/companies/:id`.

### CreateDealPage

**Arquivo:** `src/pages/CreateDealPage.tsx`

**Rota:** `/deals/new`

**Seções:**
1. **Informações da Oportunidade** (2 colunas)
   - Nome (text, obrigatório)
   - Estágio (select: opções dos estágios do pipeline)
   - Data de Fechamento (date)
   - Valor (currency)
   - Empresa (relation → `company`)
   - Contato (relation → `person`, exibe nome completo)

**Ao submeter:** Cria oportunidade via `useRecordCreate`, exibe toast de sucesso, navega para `/deals/:id`.

---

## Queries e Mutations GraphQL

### Criar Registro

```graphql
mutation CreatePerson($input: PersonCreateInput!) {
  createPerson(data: $input) { id }
}

mutation CreateCompany($input: CompanyCreateInput!) {
  createCompany(data: $input) { id }
}

mutation CreateOpportunity($input: OpportunityCreateInput!) {
  createOpportunity(data: $input) { id }
}
```

### Excluir Registro

```graphql
mutation DeletePerson($id: ID!) {
  deletePerson(id: $id) { id }
}

mutation DeleteCompany($id: ID!) {
  deleteCompany(id: $id) { id }
}

mutation DeleteOpportunity($id: ID!) {
  deleteOpportunity(id: $id) { id }
}
```

### Busca de Relacionamento (reutiliza padrão de query de lista)

```graphql
query SearchCompanies($filter: CompanyFilterInput, $first: Int) {
  companies(filter: $filter, first: $first) {
    edges { node { id name domainName { primaryLinkUrl } } }
  }
}
```

### Upload de Arquivo

```
POST /files
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
```

Resposta: `{ url: string }`

---

## Alterações de Roteamento

Novas rotas adicionadas ao `AppRouter.tsx`:

| Caminho | Página | Descrição |
|---------|--------|-----------|
| `/contacts/new` | CreateContactPage | Criar novo contato |
| `/companies/new` | CreateCompanyPage | Criar nova empresa |
| `/deals/new` | CreateDealPage | Criar nova oportunidade |

**Importante:** `/contacts/new` deve ser colocado ANTES de `/contacts/:recordId` na definição do router para garantir correspondência correta.

As páginas de detalhe existentes ganham funcionalidade de botão "Editar" (toggle de formulário completo) e "Excluir".

---

## Adições de Design Tokens

Novos valores de token (adicionados aos objetos de token existentes):

```typescript
// Novos tokens de cor para upload de arquivo e arrastar-e-soltar
colorTokens.surfaceDragOver = 'var(--eds-g-color-brand-base-5, rgba(1,118,211,0.05))';

// Novas CSS custom properties no global.css
--eds-g-color-brand-base-5: rgba(1, 118, 211, 0.05);
```

Nenhum outro token novo necessário — o conjunto existente cobre todas as necessidades da Fase 3.

---

## Checklist de Acessibilidade

- [ ] Todos os campos de formulário têm elementos `<label>` visíveis associados via `htmlFor`/`id`
- [ ] Campos obrigatórios têm `aria-required="true"` no elemento de input
- [ ] Mensagens de erro usam `aria-describedby` e `aria-live="assertive"`
- [ ] Combobox segue o [padrão WAI-ARIA combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [ ] Setas navegam opções do combobox, Enter seleciona, Escape fecha
- [ ] ConfirmDialog usa `role="alertdialog"` com `aria-describedby`
- [ ] Zona de soltar do seletor de arquivo tem `aria-label` e alternativa por teclado (botão)
- [ ] Todos os botões têm labels visíveis ou `aria-label`
- [ ] Ordem de tabulação segue a ordem lógica do documento
- [ ] Foco retorna ao elemento que acionou após modal/diálogo fechar
- [ ] Cor não é o único meio de comunicar estado (ícones acompanham cores)
- [ ] Teclado: todos os elementos interativos alcançáveis e operáveis via teclado

---

## Resumo da Estrutura de Arquivos

```
packages/twenty-eds/src/
├── components/
│   ├── Combobox/
│   │   ├── Combobox.tsx
│   │   └── index.ts
│   ├── ConfirmDialog/
│   │   ├── ConfirmDialog.tsx
│   │   └── index.ts
│   ├── FileSelector/
│   │   ├── FileSelector.tsx
│   │   └── index.ts
│   ├── FormElement/
│   │   ├── FormElement.tsx
│   │   └── index.ts
│   ├── RecordForm/
│   │   ├── RecordForm.tsx
│   │   └── index.ts
│   ├── Textarea/
│   │   ├── Textarea.tsx
│   │   └── index.ts
│   ├── Icon/
│   │   └── Icon.tsx          (atualizado — novos caminhos de ícone)
│   ├── InlineEdit/
│   │   └── InlineEdit.tsx    (atualizado — suporte a relacionamento)
│   └── index.ts              (atualizado — novos exports)
├── hooks/
│   ├── useRecordCreate.ts    (novo)
│   ├── useRecordDelete.ts    (novo)
│   ├── useFileUpload.ts      (novo)
│   └── useRelationSearch.ts  (novo)
├── pages/
│   ├── CreateContactPage.tsx  (novo)
│   ├── CreateCompanyPage.tsx  (novo)
│   └── CreateDealPage.tsx     (novo)
└── AppRouter.tsx              (atualizado — novas rotas)
```

### Arquivos Atualizados

| Arquivo | Alterações |
|---------|------------|
| `src/components/Icon/Icon.tsx` | 7 novos caminhos de ícone adicionados |
| `src/components/InlineEdit/InlineEdit.tsx` | Suporte a tipo de campo relation |
| `src/components/index.ts` | Novos exports para componentes da Fase 3 |
| `src/AppRouter.tsx` | Novas rotas de criação + conexão do botão "Novo" |
| `src/pages/ContactDetailPage.tsx` | Botão excluir + modo de edição completo |
| `src/pages/CompanyDetailPage.tsx` | Botão excluir + modo de edição completo |
| `src/pages/DealDetailPage.tsx` | Botão excluir + modo de edição completo |
| `src/pages/ContactsListPage.tsx` | Botão "Novo Contato" no cabeçalho |
| `src/pages/CompaniesListPage.tsx` | Botão "Nova Empresa" no cabeçalho |
| `src/pages/DealsListPage.tsx` | Botão "Nova Oportunidade" no cabeçalho |

---

## Definição de Pronto

Uma funcionalidade é considerada pronta quando:

1. Todas as operações CRUD funcionam via a mesma API GraphQL do frontend padrão do Twenty
2. Validação de formulário previne submissões inválidas (campos obrigatórios, verificações de formato)
3. Componentes usam apenas design tokens EDS — sem cores ou espaçamentos hardcoded
4. Acessibilidade: navegável por teclado, atributos ARIA corretos, testado com leitor de tela
5. Responsivo: funciona em tablet (768px) e desktop (1280px+)
6. Campos de relacionamento usam Combobox com busca em tempo real e vínculo de dados correto
7. Upload de arquivo funciona para pelo menos imagens e PDFs
8. Diálogo de confirmação de exclusão previne perda acidental de dados
9. Feedback via toast exibido após operações de criar/atualizar/excluir
10. Rotas adicionadas ao AppRouter e links de navegação funcionando
11. Este documento (EDS-PHASE3-CORE-CRM-ACTIONS.md) atualizado com quaisquer desvios de implementação
12. EDS-COMPONENTS.md atualizado com documentação dos novos componentes
