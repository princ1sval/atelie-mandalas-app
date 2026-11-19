# Malu Mandalas — app do ateliê

Aplicativo mobile do ateliê **Malu Mandalas** ([@malu.mandalas](https://www.instagram.com/malu.mandalas)), que produz mandalas artesanais pintadas à mão na técnica de **pontilhismo**.

O ateliê trabalha de dois jeitos, e o app foi pensado em cima disso:

- **Pronta entrega:** peças com estilo já definido (Sol, Lua, Flor de Lótus...), prontas para venda.
- **Encomendas:** peças personalizadas, feitas a partir da história de quem encomenda (família, pet, homenagem, casal). As encomendas já entregues formam o **portfólio**.

Trabalho individual da disciplina **Programação para Dispositivos Móveis** (FAMINAS), desenvolvido com **React Native + Expo (Managed Workflow) + TypeScript**.

---

## Telas

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/inicio.jpg" width="220" alt="Tela Início"><br><b>Início</b></td>
    <td align="center"><img src="docs/screenshots/pronta-entrega.jpg" width="220" alt="Tela Pronta Entrega"><br><b>Pronta entrega</b></td>
    <td align="center"><img src="docs/screenshots/detalhe.jpg" width="220" alt="Tela Detalhe da Mandala"><br><b>Detalhe da mandala</b></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/portfolio.jpg" width="220" alt="Tela Portfólio"><br><b>Portfólio</b></td>
    <td align="center"><img src="docs/screenshots/encomenda.jpg" width="220" alt="Tela Encomenda"><br><b>Encomenda</b></td>
    <td align="center"><img src="docs/screenshots/faq.jpg" width="220" alt="Tela Dúvidas"><br><b>Dúvidas (FAQ)</b></td>
  </tr>
</table>

| # | Tela | O que faz |
|---|------|-----------|
| 1 | **Início** | Apresenta o ateliê: boas-vindas, a história da Malu, o significado da mandala e a técnica do pontilhismo. Atalhos para a Pronta entrega, a Encomenda e o Portfólio. |
| 2 | **Pronta entrega** | Grade com as peças à venda (nome, tamanho e preço) e **busca por nome ou cor**, sem diferenciar acentos. Tocar num card abre o Detalhe. |
| 3 | **Detalhe da mandala** | Recebe o **`mandalaId`** por parâmetro. Mostra imagem, técnica, tamanho e a história da peça. O botão muda conforme a origem: **"Tenho interesse"** (abre o WhatsApp com mensagem pronta) ou **"Quero uma assim"** (leva à Encomenda com o tema já escolhido). Tem botão de **compartilhar**. |
| 4 | **Portfólio** | Encomendas já entregues, com **filtro por tema** (Família, Pet, Homenagem, Casal, Outro). Usa a mesma tela de Detalhe. |
| 5 | **Encomenda** | Formulário de pedido personalizado: nome, WhatsApp com máscara, tema, tamanho, cores, ideia (com contador), presente. **Estimativa de preço e prazo ao vivo**, validação dos campos e confirmação com número de protocolo. O que foi preenchido fica salvo como **rascunho** e volta quando o app é reaberto. |
| 6 | **Dúvidas (FAQ)** | Perguntas agrupadas por categoria numa **SectionList**, com busca e respostas que abrem e fecham. Atalho para falar com o ateliê no WhatsApp. |
| 7 | **Meus pedidos** | Aberta pela Encomenda. Mostra o **histórico salvo no aparelho** (SQLite), do pedido mais recente para o mais antigo, com protocolo, data e estimativa. Cada pedido pode ser **excluído**, e **"Apagar meus dados"** remove tudo o que o app guardou. |

---

## Como executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) LTS (testado com a versão 24)
- Git
- Celular com o app **Expo Go** atualizado, compatível com o **SDK 58**. No iPhone só existe a versão mais recente do Expo Go: quando ela mudar de SDK, o projeto precisa ser atualizado junto
- Uma conta gratuita na [Expo](https://expo.dev/signup), necessária para abrir o projeto no Expo Go do **iPhone**

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/princ1sval/atelie-mandalas-app.git

# 2. Entrar na pasta do projeto Expo (fica dentro do repositório)
cd atelie-mandalas-app/atelie-mandalas-app

# 3. Instalar as dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npx expo start
```

5. Leia o **QR code** que aparece no terminal:
   - **Android:** pelo próprio app Expo Go.
   - **iPhone:** pela câmera. No iPhone, o Expo Go exige login **na mesma conta Expo** no computador e no celular:
     ```bash
     npx expo login
     ```
     No Expo Go, toque no ícone de conta (canto superior direito) e entre com a mesma conta.
6. O computador e o celular precisam estar **na mesma rede Wi-Fi**. Redes que bloqueiam essa conexão, como a da faculdade, podem impedir o acesso. Nesse caso, use o roteador do celular (hotspot).
7. **Para abrir no navegador** (opcional), aperte `w` no terminal do `npx expo start`. Veja as diferenças da [versão web](#versão-web).

### Comandos úteis

| Comando | Para que serve |
|---------|----------------|
| `npx expo start --clear` | Inicia limpando o cache (útil depois de instalar bibliotecas) |
| `npx tsc --noEmit` | Confere os tipos do TypeScript sem gerar arquivos |
| `npx expo-doctor` | Verifica se as versões das bibliotecas combinam com o SDK |

---

## Arquitetura: MVVM

O app segue o padrão **MVVM (Model–View–ViewModel)**, com o ViewModel implementado como **custom hook** do React (`useXxxViewModel`).

```mermaid
flowchart LR
  V["View<br/>screens + components<br/>(só desenha)"] --> VM["ViewModel<br/>hooks useXxxViewModel<br/>(estado + ações)"]
  VM --> S["Services<br/>regras de negócio"]
  S --> R["Repositories<br/>acesso aos dados<br/>(assíncrono)"]
  R --> M["Mocks<br/>catálogo, FAQ e ateliê"]
  R --> D["DAO<br/>PedidoDao (SQL)"]
  D --> DB[("SQLite<br/>histórico de pedidos")]
  R --> AS[("AsyncStorage<br/>rascunho")]
```

| Camada | Pasta | Responsabilidade |
|--------|-------|------------------|
| **Model** | `src/model` | Tipos e entidades: `Mandala`, `PedidoEncomenda`, `PedidoSalvo`, `PerguntaFaq`, `Atelie`. |
| **View** | `src/view` | Telas e componentes. Só desenham o que o ViewModel entrega e repassam as ações do usuário. **Não têm regra de negócio.** |
| **ViewModel** | `src/viewmodel` | Um hook por tela. Guarda o estado (`useState`), carrega os dados (`useEffect`), calcula valores derivados (`useMemo`) e expõe ações. Cada um tem uma `interface` que é o contrato com a tela. |
| **Services** | `src/services` | Regras de negócio: separar pronta entrega e portfólio, buscar sem acento, filtrar por tema, decidir o botão do Detalhe, validar o pedido, estimar preço e prazo, guardar e conferir o rascunho, apagar os dados da cliente, agrupar o FAQ, montar os links do WhatsApp. |
| **Repositories** | `src/data/repositories` | Única porta de acesso aos dados. Cada um tem uma `interface` (contrato) e uma implementação: os do catálogo, do FAQ e do ateliê leem os mocks; o de encomendas grava no SQLite, pelo DAO; o de rascunho usa o AsyncStorage. |
| **DB** | `src/db` | Banco SQLite: abre a conexão (`dbConfig.ts`), aplica as migrations (`migrations.ts`) e reúne o SQL da tabela de pedidos (`PedidoDao.ts`). |
| **Mocks** | `src/data/mocks` | Dados falsos em arquivos locais. |

### Por que MVVM?

- **É o encaixe mais natural no React Native:** os hooks já são uma forma de separar "estado + lógica" da "interface". Cada tela tem o seu `useXxxViewModel`, e o componente da tela fica responsável só por desenhar.
- **Telas sem regra de negócio:** a View não sabe de onde vêm os dados nem como são filtrados. Ela chama, por exemplo, `vm.alterarBusca(texto)` e mostra `vm.mandalas`.
- **O ViewModel não conhece a View:** ele não sabe que existem telas, botões ou navegação. Quando uma ação precisa navegar (como o "Quero uma assim"), a tela passa uma função para o ViewModel.
- **Pronto para a Parte 2:** como os Repositories já são **assíncronos** (retornam `Promise`, imitando uma API) e têm interface, trocar a fonte de dados não exige mudar telas nem ViewModels (veja [Preparação para a Parte 2](#preparação-para-a-parte-2)).
- **Fácil de testar e explicar:** as regras ficam em funções puras nos Services, separadas da interface.

---

## Persistência e privacidade

Seguindo o material **18 – Persistência**, cada dado fica no lugar que combina com o tipo dele (mapa de decisão da seção 7.1):

| Dado | Onde fica | Por quê |
|------|-----------|---------|
| Histórico de pedidos: protocolo, tema, tamanho, cores, ideia, presente, inspiração, estimativa e data | **SQLite** (`expo-sqlite`), tabela `pedidos` | É uma lista que cresce e aparece em ordem (seção 4.1) |
| Rascunho do formulário de encomenda, inclusive nome e WhatsApp | **AsyncStorage**, uma chave com JSON | É um único objeto, sobrescrito a cada alteração e sem busca (seção 3.1) |
| Nome e WhatsApp depois do envio | **Não são guardados** | O histórico não precisa deles (seção 7.3) |
| Mandalas, perguntas do FAQ, dados do ateliê e preços | **No código** (mocks) | São do app e só de leitura |
| Senha, token e cartão | **Não existem no app** | Não há login, e o pagamento é combinado pelo WhatsApp (seção 7.2) |

### SQLite: configuração e migrations

- O banco `malu-mandalas.db` abre uma vez, quando o app inicia, em `src/db/dbConfig.ts`, com **WAL**, **foreign_keys** ligado e `synchronous = NORMAL` (seções 4.4 e 4.5).
- A estrutura evolui por **migrations**, controladas pelo `PRAGMA user_version` (seção 4.3). Cada uma roda **uma vez por aparelho** e **dentro de uma transação**: ou é aplicada inteira, ou nada muda.

| Versão | O que faz |
|--------|-----------|
| 1 | Cria a tabela `pedidos`, já sem colunas de nome e WhatsApp |
| 2 | Acrescenta a estimativa (`precoMinimo`, `precoMaximo`, `prazoDias`) com `ALTER TABLE`, sem apagar os pedidos que já existiam. Esses aparecem com "Estimativa não registrada" |

- Para mudar o banco, acrescenta-se uma versão nova no fim da lista. Uma versão que já rodou nunca é editada, porque os aparelhos que a aplicaram não a rodariam de novo.
- Todo o SQL da tabela fica no `PedidoDao`, com `?` no lugar dos valores: o texto digitado nunca vira parte do comando.

### Rascunho no AsyncStorage

- É salvo 500 ms depois da última alteração, e não a cada letra.
- Só começa a salvar depois de ler o rascunho anterior. Antes disso, o formulário ainda vazio o apagaria.
- O tema e a inspiração vindos do "Quero uma assim" têm prioridade sobre os do rascunho.
- É apagado quando o pedido é enviado e quando o formulário fica vazio.
- O que vem do armazenamento é conferido antes de voltar à tela: um JSON estragado ou um campo estranho não quebra o formulário.

### Privacidade (LGPD, seção 7.3)

- **Tudo fica neste aparelho.** O envio do pedido é simulado, e nada sai do celular.
- **Só o necessário:** o histórico não guarda nome nem WhatsApp, e o rascunho existe só enquanto o formulário está sendo preenchido.
- **A cliente pode apagar tudo:** em Meus pedidos, cada pedido pode ser excluído, e **"Apagar meus dados"** remove o rascunho e todo o histórico. O catálogo continua, porque é do app e não da cliente (seção 9.3).
- **Ao desinstalar o app**, o SQLite e o AsyncStorage são apagados (seção 8.1). Um backup do aparelho, no iCloud ou no Google, pode restaurá-los (seção 8.3).
- A ideia da encomenda é texto livre e pode citar algo sensível, como numa homenagem. Por isso a exclusão está sempre à mão.

### Diferenças em relação ao material

- **Transação nas migrations:** sem ela, uma falha no meio deixaria o banco pela metade.
- **`datetime('now', 'localtime')`:** o `datetime('now')` grava em UTC, 3 horas à frente de Brasília.
- **Migration 2 sem `DEFAULT`:** o `DEFAULT (datetime(...))` do exemplo da seção 10 falha em `ALTER TABLE`. Aqui os pedidos antigos ficam com a estimativa em branco (NULL).
- **Histórico ordenado por `id`:** a seção 4.2 ordena pela data, mas dois pedidos no mesmo segundo empatariam.
- **`JSON.parse` protegido:** um rascunho estragado é ignorado em vez de quebrar a tela.
- **Sem MMKV e sem SecureStore:** o MMKV exige development build, e o app roda no Expo Go. O SecureStore serve para tokens e senhas, que o app não tem.

### Versão web

O app também abre no navegador (tecla `w` no `npx expo start`). O `metro.config.js` permite o SQLite na web, que roda em WebAssembly e precisa de dois cabeçalhos de segurança. O que muda em relação ao celular:

- ao iniciar o app, a primeira abertura do banco falha porque o worker do `expo-sqlite` ainda está carregando, e aparece um erro no console; a chamada seguinte abre o banco normalmente;
- o banco do navegador não usa WAL (`journal_mode=delete`);
- os dados ficam no armazenamento do navegador, separados dos do celular;
- as confirmações usam o `confirm` do navegador, porque o `Alert` do React Native não funciona na web.

---

## Estrutura de pastas

Organização **por tipo** (camada), coerente com o MVVM:

```
atelie-mandalas-app/                 ← repositório
├── README.md
├── docs/screenshots/                ← imagens deste README
└── atelie-mandalas-app/             ← projeto Expo
    ├── App.tsx                      ← carrega as fontes, abre o banco e monta a navegação
    ├── app.json                     ← nome, ícone e configurações do app
    ├── metro.config.js              ← SQLite na versão web
    ├── assets/
    │   └── mandalas/                ← imagens das mandalas
    └── src/
        ├── model/                   ← MODEL: tipos e entidades
        │   ├── Atelie.ts
        │   ├── Encomenda.ts
        │   ├── Faq.ts
        │   └── Mandala.ts
        ├── db/                      ← banco SQLite
        │   ├── dbConfig.ts          ← abre a conexão (WAL, foreign_keys) e roda as migrations
        │   ├── migrations.ts        ← versões do banco (PRAGMA user_version)
        │   └── PedidoDao.ts         ← SQL da tabela pedidos
        ├── data/
        │   ├── mocks/               ← dados falsos (arquivos locais)
        │   │   ├── atelie.mock.ts
        │   │   ├── faq.mock.ts
        │   │   └── mandalas.mock.ts
        │   └── repositories/        ← acesso aos dados (interface + implementação)
        │       ├── AtelieRepository.ts
        │       ├── EncomendaRepository.ts   ← pedidos no SQLite, pelo PedidoDao
        │       ├── FaqRepository.ts
        │       ├── MandalaRepository.ts
        │       └── RascunhoRepository.ts    ← rascunho no AsyncStorage
        ├── services/                ← regras de negócio
        │   ├── AtelieService.ts
        │   ├── EncomendaService.ts
        │   ├── FaqService.ts
        │   └── MandalaService.ts
        ├── viewmodel/               ← VIEWMODEL: um hook por tela
        │   ├── useInicioViewModel.ts
        │   ├── useProntaEntregaViewModel.ts
        │   ├── useDetalheMandalaViewModel.ts
        │   ├── usePortfolioViewModel.ts
        │   ├── useEncomendaViewModel.ts
        │   ├── useMeusPedidosViewModel.ts
        │   └── useFaqViewModel.ts
        ├── view/                    ← VIEW
        │   ├── screens/             ← as 7 telas
        │   ├── components/          ← componentes autorais reutilizáveis
        │   ├── hooks/               ← hooks visuais (useGrade: colunas responsivas)
        │   ├── styles/              ← tema: colors, spacing, typography, icons, theme
        │   └── utils/               ← confirmar: Alert no celular, confirm na web
        ├── navigation/              ← navegadores e tipos das rotas
        │   ├── AppNavigator.tsx     ← Tab (raiz)
        │   ├── ProntaEntregaStack.tsx
        │   ├── PortfolioStack.tsx
        │   ├── EncomendaStack.tsx
        │   ├── opcoesStack.ts
        │   ├── temaNavegacao.ts
        │   └── types.ts             ← ParamLists e props tipadas
        └── utils/                   ← funções puras de apoio
            ├── esperar.ts
            ├── formatters.ts        ← moeda, faixa de preço, telefone, data, plural
            ├── texto.ts             ← normalizar texto, apenas dígitos
            └── validators.ts
```

---

## Navegação

**React Navigation 7**, com navegação **aninhada**: **Tab** na raiz e um **Stack** dentro das abas Pronta entrega, Portfólio e Encomendar. Todas as rotas são **tipadas** em `src/navigation/types.ts`.

```
Tab.Navigator (raiz)
├── Inicio
├── ProntaEntregaTab ─ Stack ─┬─ ProntaEntrega
│                             └─ DetalheMandala   { mandalaId: string }
├── PortfolioTab ───── Stack ─┬─ Portfolio
│                             └─ DetalheMandala   { mandalaId: string }
├── Encomendar ─────── Stack ─┬─ Encomenda        { tema?; inspiracaoId?; limparEm? }
│                             └─ MeusPedidos
└── Duvidas
```

- Cada aba com Stack guarda **o próprio histórico**.
- Os parâmetros são sempre **simples (serializáveis)**: passa-se o **id**, e o Detalhe busca a mandala pelo Service.
- `CompositeScreenProps` permite que uma tela dentro de um Stack navegue para outra aba. É assim que "Quero uma assim" vai do Detalhe para o formulário da aba Encomendar levando `tema` e `inspiracaoId`.
- A mesma tela `DetalheMandalaScreen` é usada nos dois Stacks.
- No React Navigation 7, navegar para uma tela que já está na pilha, mas não está à vista, **empilha uma cópia nova**. Por isso o "Quero uma assim" e os atalhos do Início usam `pop: true`, que volta à tela que já existe. O "Encomendar a sua" também usa `merge: true`, para manter a inspiração escolhida.
- Depois de "Apagar meus dados", Meus pedidos volta ao formulário com `popTo` e o parâmetro `limparEm`, que esvazia o formulário guardado na memória.

---

## Componentes

### Componentes autorais (com props tipadas e reutilizados)

| Componente | Props principais | Usado em |
|------------|------------------|----------|
| `BotaoPrimario` | `titulo`, `onPress`, `variante`, `icone`, `carregando`, `desabilitado` | Início, Detalhe, Encomenda, Meus pedidos, Dúvidas, MensagemEstado |
| `CampoTexto` | `rotulo`, `erro`, `icone`, `formato`, `mostrarContador` + todas as props de `TextInput` | Pronta entrega, Encomenda, Dúvidas |
| `Chip` | `rotulo`, `selecionado`, `onPress` | Portfólio (filtro), Encomenda (tema e tamanho) |
| `TituloSecao` | `titulo`, `sobretitulo`, `descricao`, `nivel` | Todas as telas, menos Meus pedidos, que usa o título do cabeçalho |
| `MandalaCard` | `mandala`, `onPress`, `style` | Pronta entrega, Portfólio |
| `GradeMandalas` | `mandalas`, `onAbrirMandala`, `mensagemVazia` | Pronta entrega, Portfólio |
| `MensagemEstado` | `tipo` (carregando, erro ou vazio), `mensagem`, `onTentarNovamente` | Início, Pronta entrega, Detalhe, Portfólio, Meus pedidos, Dúvidas |

### Componentes nativos do React Native usados

`View`, `Text`, `Image`, `ScrollView`, **`FlatList`** (grade de mandalas), **`SectionList`** (FAQ), **`TextInput`** (busca e formulário), `Pressable`, `Switch`, `Modal`, `ActivityIndicator`. Também são usadas as APIs `Linking` (WhatsApp), `Share` (compartilhar), `Alert` (confirmações), `Keyboard`, `Platform` e `useWindowDimensions`.

---

## Estilização e responsividade

- Todos os estilos fixos usam **`StyleSheet.create`**. O estilo inline aparece só para valores dinâmicos, como a largura calculada de cada card.
- **Tema centralizado** em `src/view/styles/`:
  - `colors.ts`: paleta do ateliê (tirada do Instagram). É o **único arquivo com códigos de cor**.
  - `spacing.ts`: escala de espaçamentos e arredondamentos.
  - `typography.ts`: fontes **Fraunces** (títulos) e **Poppins** (textos) e estilos de texto prontos.
  - `theme.ts`: reúne tudo, mais a sombra por plataforma (`Platform.select`) e a largura máxima.
- **Layout adaptável:**
  - `useGrade` usa `useWindowDimensions` para mostrar **2 colunas no celular e 3 no tablet**, com a largura exata de cada card.
  - Em telas largas, o conteúdo de leitura fica limitado a 640 de largura e centralizado (`larguraMaxima`).
  - Layout em flexbox com `gap`, `SafeAreaView` para respeitar o entalhe e ajuste automático do teclado nos formulários.

---

## Tecnologias e bibliotecas

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| Expo (Managed Workflow) | SDK 58 | Base do projeto |
| React Native | 0.88 | Interface nativa |
| React | 19.3 | Componentes e hooks |
| TypeScript | 6.0 | Tipagem |
| @react-navigation/native, native-stack, bottom-tabs | 7.x | Navegação (Tab + Stack) |
| react-native-screens / react-native-safe-area-context | 4.30 / 5.11 | Dependências da navegação e áreas seguras |
| @expo/vector-icons (Feather) | 15 | Ícones |
| expo-font + @expo-google-fonts (Fraunces e Poppins) | 58 / 0.4 | Fontes da identidade visual |
| expo-sqlite | 58 | Banco local: histórico de pedidos |
| @react-native-async-storage/async-storage | 2.2 | Rascunho do formulário |
| react-dom + react-native-web | 19.3 / 0.21 | Versão para o navegador |

Todas as bibliotecas foram instaladas com **`npx expo install`**, que escolhe a versão compatível com o SDK.

---

## Preparação para a Parte 2

A fonte de dados pode ser trocada (API, banco local etc.) **mexendo só nos Repositories**. Isso já aconteceu na persistência: o `EncomendaRepository` trocou o array em memória pelo SQLite sem mudar o Service, o ViewModel nem a tela. Cada Repository tem uma interface, por exemplo:

```ts
export interface MandalaRepository {
  listar(): Promise<Mandala[]>;
  buscarPorId(id: string): Promise<Mandala | undefined>;
}
```

Hoje a implementação lê o mock. Para usar uma API, basta outra implementação com a mesma interface:

```ts
export const mandalaRepository: MandalaRepository = {
  async listar() {
    const resposta = await fetch('https://sua-api.com/mandalas');
    return resposta.json();
  },
  async buscarPorId(id) {
    const resposta = await fetch(`https://sua-api.com/mandalas/${id}`);
    return resposta.ok ? resposta.json() : undefined;
  },
};
```

Services, ViewModels e telas continuam iguais. Os ViewModels já tratam **carregando** e **erro** (com o botão "Tentar de novo"), que passam a fazer diferença quando os dados vierem da rede. O tipo `ImagemMandala` também já aceita imagem local (`require`) ou da internet (`{ uri }`).

---

## Requisitos do trabalho

| Requisito | Como foi atendido |
|-----------|-------------------|
| Expo Managed + TypeScript, commits progressivos | Template `blank-typescript` (criado no SDK 57 e atualizado para o 58), um commit por etapa |
| Mínimo de 6 telas com propósito real | 7 telas: Início, Pronta entrega, Detalhe, Portfólio, Encomenda, Meus pedidos, Dúvidas |
| Tab ou Drawer na raiz + Stack interno | Tab na raiz + Stacks de Pronta entrega, Portfólio e Encomendar |
| Tela que recebe parâmetros e rotas tipadas | `DetalheMandala { mandalaId }` e `Encomenda { tema?, inspiracaoId?, limparEm? }`, em `navigation/types.ts` |
| 6+ componentes nativos, com lista e campo de entrada | 11 componentes, entre eles `FlatList`, `SectionList` e `TextInput` |
| 3+ componentes autorais tipados e reutilizados | 7 componentes, cada um usado em mais de uma tela |
| MVC, MVP ou MVVM aplicado de forma consistente | MVVM: 7 telas e 7 ViewModels; regras nos Services |
| Pastas coerentes com a arquitetura | Organização por tipo (camada) |
| `StyleSheet.create`, tema centralizado, layout adaptável | Tema em `view/styles`, sem cores soltas, grade responsiva |
| Biblioteca de terceiros via `npx expo install` | React Navigation, @expo/vector-icons, expo-font, Google Fonts, expo-sqlite e AsyncStorage |
| Dados mockados acessados por camada própria | Mocks → Repositories → Services |
| Persistência local (aula 18) | SQLite com migrations, WAL e DAO para o histórico; AsyncStorage para o rascunho; exclusão dos dados (LGPD). Veja [Persistência e privacidade](#persistência-e-privacidade) |

---

## Observações

- As **imagens das mandalas** são ilustrações provisórias criadas para o protótipo. As fotos reais das peças do ateliê vão substituí-las mantendo os mesmos nomes de arquivo. Fotos de encomendas (pessoas, pets, homenagens) só entram com autorização dos clientes.
- **Preços e prazos** são provisórios. O WhatsApp do ateliê fica em `src/data/mocks/atelie.mock.ts`.
- O envio de encomenda é **simulado**: o pedido não chega à Malu. Ele fica só no histórico deste aparelho (SQLite), sem nome e WhatsApp.

---

## Autor

**João Pedro Batista Princisval**
Análise e Desenvolvimento de Sistemas, FAMINAS
Disciplina: Programação para Dispositivos Móveis, prof. Thiago Goldoni Thomé
