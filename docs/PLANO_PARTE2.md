# Plano da Parte 2: o que falta para entregar

> **Situação em 24/11/2026: plano executado.** As etapas 2 a 8 e 10 estão nos commits da branch, e o README descreve o resultado (seções Contexto, Recursos nativos e permissões, Persistência e Testes). Faltam só a Etapa 9 (apontamentos da Parte 1, que dependem do retorno do professor) e rodar os fluxos do Maestro num emulador. Os nomes e as contagens finais dos testes estão no README; as tabelas abaixo eram a proposta inicial.

> **Para quem vai executar (eu ou o Claude Code na minha máquina):** siga as etapas **na ordem**, uma por vez.
> Ao fim de cada etapa: rode o app, rode os testes que já existem e faça **um commit** com a mensagem sugerida.
> Não pule a explicação de cada decisão: na apresentação o professor pode abrir qualquer arquivo e pedir para explicar.
>
> Comando sugerido no Claude Code: *"Leia `docs/PLANO_PARTE2.md` e execute a Etapa N. Explique o que mudou e por quê antes de commitar."*

Enunciado: **Trabalho Prático · Parte 2**, Programação para Dispositivos Móveis, FAMINAS. Entrega: **23/11/2026**, com o link do repositório enviado pelo Moodle.

---

## 0. Diagnóstico: o que já está pronto e o que falta

| Requisito do enunciado | Situação hoje | O que fazer |
|---|---|---|
| **Base da Parte 1** (telas, navegação aninhada, componentes, MVVM, pastas, estilo, histórico de commits) | ✅ Mantida, com 29 commits progressivos | Não reescrever o histórico. Corrigir o que a avaliação da Parte 1 apontou (Etapa 9) |
| **Contexto** com Provider e hook customizado em `src/context/` | ❌ **Não existe.** `useSessao` é um hook comum: cada tela que o chama abre a própria escuta do Firebase. O perfil é compartilhado por um "observer" feito à mão (`PerfilService.observar`) | **Etapa 2** |
| **Persistência** adequada ao tipo de dado | ✅ SQLite com migrations (pedidos), AsyncStorage (rascunho e perfil), SecureStore (tokens do Firebase) e arquivo (foto) | Só documentar direito no README (Etapa 8) |
| **2 sensores ou recursos nativos** | ✅ Acelerômetro (chacoalhar), localização (cidade e distância), câmera e galeria (foto do perfil) | Falta o **atalho para os Ajustes** quando a permissão é negada (Etapa 3) |
| **20 testes unitários** | ❌ Nenhum | **Etapa 5** |
| **10 testes de integração** | ❌ Nenhum | **Etapa 6** |
| **8 testes de UI** (React Native Testing Library) | ❌ Nenhum | **Etapa 7** |
| **2 testes E2E** (Maestro) | ❌ Nenhum | **Etapa 8** |
| **README atualizado** | ⚠️ Desatualizado: diz "Não há login" e "Sem SecureStore", mas o app tem os dois. Não explica testes, permissões nem contexto | **Etapa 10** |

### Ordem de prioridade (o prazo é hoje)

1. Configurar o Jest (Etapa 4) → unitários (5) → integração (6) → UI (7). **É a maior parte da nota que falta.**
2. Contexto (Etapa 2). É obrigatório e rápido.
3. README (Etapa 10).
4. Maestro (Etapa 8), com o vídeo gravado.
5. Atalho para os Ajustes (Etapa 3) e acabamentos.

> Se o tempo apertar, faça a Etapa 2 **antes** dos testes de UI, porque alguns testes de UI usam o contexto.

---

## 1. Preparar a máquina

```bash
# 1. Atualizar o repositório (o plano está na branch claude/admiring-davinci-x9y69r)
git checkout main
git pull origin main
git fetch origin claude/admiring-davinci-x9y69r
git merge --ff-only FETCH_HEAD        # traz este arquivo para a main, sem conflito

# 2. Instalar as dependências do app (a pasta do Expo fica dentro do repositório)
cd atelie-mandalas-app
npm install

# 3. Firebase: copiar o modelo e preencher com as chaves do console
cp .env.example .env                   # no Windows: copy .env.example .env

# 4. Conferir que o app abre
npx expo start
```

Para os testes E2E você vai precisar de um **emulador Android** (Android Studio) com o **Expo Go**, ou de um celular Android ligado por USB, além do **Maestro** instalado (Etapa 8).

---

## 2. Contexto (`src/context/`)

### O que vai para o contexto e por quê

Pela dica do enunciado, só vai para o contexto o que é **lido ou alterado em telas distantes**:

| Contexto | Quem lê | Quem altera | Por que não pode ser só `useState` |
|---|---|---|---|
| **SessaoContext**: usuário logado e "verificando" | aba Perfil (`PerfilStack`), Encomenda (pede login ao enviar), Perfil (mostra o e-mail) | Entrar, Cadastro, botão Sair | Hoje cada `useSessao()` cria **uma escuta nova** do `onAuthStateChanged`. Com o Provider, o app tem uma escuta só e todas as telas veem o mesmo estado |
| **PerfilContext**: perfil salvo (nome, WhatsApp, foto, cidade) | Início (saudação "Olá, Ana!"), Encomenda (preenche nome e WhatsApp), Perfil | Perfil (Salvar), Meus pedidos ("Apagar meus dados") | São **abas diferentes**. Hoje isso funciona por um observer manual no `PerfilService` (`ouvintes`, `observar`, `avisarMudanca`), que é exatamente o problema que o Context resolve |

**Continua em `useState`:** o que a cliente está digitando no Perfil antes de salvar, os erros dos formulários, o modal de confirmação, a busca, o FAQ aberto e os avisos de permissão.

### 2.1 `src/context/SessaoContext.tsx`

- Mover a lógica de `src/viewmodel/useSessao.ts` para cá e **apagar** o arquivo antigo.
- `SessaoProvider`: um `useEffect` com `AuthService.observar(...)` (o retorno é o cleanup), mais `useState` para `usuario` e `verificando`.
- `value` memoizado com `useMemo(() => ({ usuario, verificando }), [usuario, verificando])`.
- Hook `useSessao()`: usa `useContext` e **lança um erro** com mensagem clara se for usado fora do Provider. Exemplo: `"useSessao precisa estar dentro de <SessaoProvider>"`.
- Atualizar os imports em `navigation/PerfilStack.tsx`, `viewmodel/useEncomendaViewModel.ts` e `viewmodel/usePerfilViewModel.ts`, e o comentário em `viewmodel/useAuthViewModel.ts`.

### 2.2 `src/context/perfilReducer.ts` (função pura, testável)

```ts
export interface EstadoPerfil {
  perfil: Perfil;
  carregando: boolean;
  erro: string | null;
}

export type AcaoPerfil =
  | { tipo: 'carregando' }
  | { tipo: 'carregou'; perfil: Perfil }
  | { tipo: 'falhou'; mensagem: string }
  | { tipo: 'salvou'; perfil: Perfil }
  | { tipo: 'apagou' };

export const estadoInicialPerfil: EstadoPerfil = { perfil: PerfilService.criarPerfilVazio(), carregando: true, erro: null };

export function perfilReducer(estado: EstadoPerfil, acao: AcaoPerfil): EstadoPerfil { /* switch por acao.tipo */ }
```

O enunciado sugere combinar contexto e `useReducer` quando a lógica cresce. Além disso, o reducer conta como teste unitário.

### 2.3 `src/context/PerfilContext.tsx`

- `PerfilProvider` com `useReducer(perfilReducer, estadoInicialPerfil)`.
- Ao montar, `carregar()`: `dispatch({tipo:'carregando'})`, depois `PerfilService.carregar()` e então `carregou` ou `falhou`. É o padrão "ler do armazenamento ao abrir".
- Funções do `value`, todas com `useCallback`:
  - `recarregar()`
  - `salvar(novo: Perfil): Promise<Perfil>` chama `PerfilService.salvar(novo, estado.perfil)` e depois `dispatch({tipo:'salvou'})`.
  - `apagar(): Promise<void>` chama `PerfilService.apagar()` e depois `dispatch({tipo:'apagou'})`.
- `value` com `useMemo`.
- Hook `usePerfil()` que lança um erro fora do Provider.

### 2.4 Ligar tudo no `App.tsx`

```tsx
<SafeAreaProvider>
  <SessaoProvider>
    <PerfilProvider>
      <NavigationContainer theme={temaNavegacao}>
        <AppNavigator />
        ...
```

### 2.5 Trocar o observer manual pelo contexto

- **`PerfilService`**: remover `ouvintes`, `observar` e `avisarMudanca`. O Service volta a ser só regra (validar, restaurar, salvar arquivo e chave) e o estado compartilhado passa a morar no contexto.
- **`useInicioViewModel`**: trocar o `useEffect` com `PerfilService.carregar/observar` por `const { perfil } = usePerfil();`.
- **`usePerfilViewModel`**:
  - O `salvo` vem do contexto. A cópia em edição (`perfil` da tela) **continua em `useState`**, porque é texto digitado.
  - Um `useEffect([perfilDoContexto])` copia o perfil do contexto para a tela quando ele muda. Por exemplo, depois do "Apagar meus dados", ele zera os avisos como o observer fazia.
  - `salvar()` chama `perfilCtx.salvar(perfil)`.
- **`useEncomendaViewModel`**:
  - `const { perfil, carregando: carregandoPerfil } = usePerfil();`.
  - Guardar o perfil anterior num `useRef` e, num `useEffect([perfil])`, chamar `EncomendaService.preencherComPerfil(atual, perfil, perfilAnteriorRef.current)` e depois atualizar o ref.
  - ⚠️ **Armadilha:** o rascunho é lido de forma assíncrona e é salvo **sem** nome e WhatsApp (`semDadosDoPerfil`). Ao restaurar o rascunho, aplique `preencherComPerfil(rascunho, perfilAtual)`. Só marque `rascunhoPronto = true` depois de o rascunho ter sido lido **e** de `carregandoPerfil` ser `false`. Senão, o formulário apaga o rascunho ou perde o nome.
- **`useMeusPedidosViewModel`**: depois de `EncomendaService.apagarMeusDados()` dar certo, chamar `perfilCtx.recarregar()`. O perfil já foi apagado do armazenamento, e o contexto lê o perfil vazio, o que atualiza Início, Encomenda e Perfil.

### 2.6 Conferir à mão

1. Salvar o nome "Ana" no Perfil: a Início mostra "Olá, Ana!" e o formulário de Encomenda vem preenchido.
2. Fechar e abrir o app: continua igual, porque está persistido.
3. Em Meus pedidos, "Apagar meus dados": a saudação some e o formulário esvazia.
4. Entrar e sair da conta: a aba Perfil troca entre Entrar e Perfil sozinha.

**Commits:**
- `feat: SessaoContext com Provider e useSessao em src/context`
- `feat: PerfilContext com useReducer substitui o observer do PerfilService`

---

## 3. Permissões: atalho para os Ajustes

O enunciado pede: *"Peça a permissão no momento de uso, trate a negação sem bloquear o app e ofereça o atalho para as configurações."* As duas primeiras partes já estão feitas. Falta a terceira.

- No `usePerfilViewModel`, além de `avisoFoto` e `avisoCidade`, expor `podeAbrirAjustesFoto` e `podeAbrirAjustesCidade`, que só ficam `true` no caso `sem-permissao`, e uma função `abrirAjustes()` que chama `Linking.openSettings()` (de `react-native`).
- Na `PerfilScreen`, abaixo do aviso, mostrar um `BotaoPrimario variante="contorno" titulo="Abrir Ajustes"` quando a flag for `true`.
- Opcional, mas bom de explicar: usar `permissao.canAskAgain` para diferenciar "negou agora" de "negou para sempre". No segundo caso o sistema nem mostra a pergunta de novo, então o único caminho é pelos Ajustes.
- Conferir: no emulador, negar a câmera e a localização. O app continua funcionando, aparece o aviso e o botão abre os Ajustes do app.

**Commit:** `feat: atalho para os Ajustes quando a permissão é negada`

---

## 4. Configurar o Jest

```bash
cd atelie-mandalas-app
npx expo install jest-expo jest @testing-library/react-native
npm install --save-dev @types/jest sql.js @types/sql.js
# se o RNTL reclamar de react-test-renderer: npx expo install react-test-renderer
```

> O `sql.js` é o SQLite compilado para WebAssembly e roda no Node sem compilar nada nativo. Ele é o **test double do banco**: os testes de integração rodam o SQL de verdade das migrations e do `PedidoDao`.

### `package.json`

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest",
  "test:unit": "jest __tests__/unit",
  "test:integration": "jest __tests__/integration",
  "test:ui": "jest __tests__/ui",
  "test:coverage": "jest --coverage",
  "test:e2e": "maestro test e2e/"
},
"jest": {
  "preset": "jest-expo",
  "setupFiles": ["<rootDir>/jest.setup.ts"],
  "testPathIgnorePatterns": ["/node_modules/", "/e2e/"],
  "collectCoverageFrom": ["src/**/*.{ts,tsx}", "!src/data/mocks/**"]
}
```

### `jest.setup.ts` (mocks globais das bibliotecas nativas)

```ts
// AsyncStorage: mock oficial, guarda na memória (documentação do pacote)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Safe area: mock oficial do pacote
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// SecureStore: um Map na memória
jest.mock('expo-secure-store', () => {
  const dados = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => dados.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => void dados.set(k, v)),
    deleteItemAsync: jest.fn(async (k: string) => void dados.delete(k)),
  };
});

// esperar(): os repositories imitam o tempo de rede. Nos testes, sem espera.
jest.mock('./src/utils/esperar', () => ({ esperar: () => Promise.resolve() }));
```

- Se `toBeOnTheScreen` ou `toHaveTextContent` não existirem, acrescente `import '@testing-library/react-native/extend-expect';`. Nas versões mais novas do RNTL os matchers já vêm embutidos.
- `expo-location`, `expo-image-picker`, `expo-sensors`, `expo-file-system` e `firebase/auth` são mockados **em cada teste que precisa deles**, com `jest.mock(...)` no topo do arquivo.
- Os tipos do Jest (`describe`, `expect`…) vêm do `@types/jest`. Normalmente o TypeScript já os encontra sozinho.

**Se der erro ao rodar o Jest:**

| Erro | O que fazer |
|---|---|
| `Cannot use import statement outside a module` vindo do `firebase` | No `jest.setup.ts`, mocke a configuração do Firebase para todos os testes com `jest.mock('./src/data/remote/firebase', () => ({ auth: null, firebaseConfigurado: false }))` e o `firebase/auth` com funções `jest.fn()`. Nos testes do AuthRepository, sobrescreva com `auth: {}` |
| Erro de módulo nativo do `expo-sqlite` ao importar uma tela | Mocke `expo-sqlite` no setup: `jest.mock('expo-sqlite', () => ({ openDatabaseSync: jest.fn() }))`. Os testes de banco usam o `bancoDeTeste` mesmo assim |
| `Accuracy` indefinido no teste de localização | O mock do `expo-location` precisa ter `Accuracy: { Balanced: 3 }` |

### Estrutura de pastas dos testes

```
atelie-mandalas-app/
├── __tests__/
│   ├── helpers/
│   │   ├── bancoDeTeste.ts        # adaptador sql.js → API síncrona do expo-sqlite
│   │   └── fabricas.ts            # pedidoValido(), perfilValido(), mandala(...)
│   ├── unit/                      # funções puras, reducers, validações e regras dos services
│   ├── integration/               # service + repository + armazenamento (com doubles)
│   └── ui/                        # componentes e telas com React Native Testing Library
├── e2e/                           # fluxos do Maestro (.yaml)
└── jest.setup.ts
```

**Commit:** `chore: configura Jest com jest-expo, Testing Library e mocks nativos`

---

## 5. Testes unitários (meta: 20, sugestão: ~30) em `__tests__/unit/`

Cada teste verifica **um comportamento** com `expect` real. O enunciado avisa que testes sem asserção relevante não contam.

| # | Arquivo | Teste |
|---|---|---|
| 1 | `texto.test.ts` | `normalizarTexto('  Céu AZUL ')` → `'ceu azul'` (minúsculas, sem acento, sem espaço nas pontas) |
| 2 | `texto.test.ts` | `apenasDigitos('(32) 99999-0000')` → `'32999990000'` |
| 3 | `texto.test.ts` | `iniciais`: `'Ana Clara Souza'` → `'AS'`, `'ana'` → `'A'`, `'   '` → `''` |
| 4 | `texto.test.ts` | `primeiroNome('  Ana Clara ')` → `'Ana'` |
| 5 | `formatters.test.ts` | `formatarTelefone`: `''` → `''`, `'3'` → `'(3'`, `'3299'` → `'(32) 99'` |
| 6 | `formatters.test.ts` | `formatarTelefone`: fixo de 10 dígitos → `'(32) 8710-3005'`, celular de 11 → `'(32) 99999-0000'` |
| 7 | `formatters.test.ts` | `formatarTelefone` corta o que passa de 11 dígitos |
| 8 | `formatters.test.ts` | `formatarDataHora('2026-11-08 09:20:48')` → `'08/11/2026 às 09:20'` |
| 9 | `formatters.test.ts` | `formatarDistancia`: `0.4` → `'menos de 1 km'`, `3.6` → `'4 km'`, `1234.5` → `'1.235 km'` |
| 10 | `formatters.test.ts` | `formatarQuantidade(1, 'peça', 'peças')` → `'1 peça'` e `(6, …)` → `'6 peças'` |
| 11 | `formatters.test.ts` | `formatarFaixaPreco(250, 320)` contém `'250'` e `'320'` (use `toMatch`, porque o `Intl` pode trocar o espaço por um espaço especial) |
| 12 | `validators.test.ts` | `ehTelefoneValido`: 10 e 11 dígitos → `true`; 9 e 12 → `false` |
| 13 | `distancia.test.ts` | Mesmo ponto → `0` |
| 14 | `distancia.test.ts` | É simétrica, ou seja, `distanciaKm(a, b) === distanciaKm(b, a)`, e Muriaé–Juiz de Fora fica entre 100 e 130 km |
| 15 | `movimento.test.ts` | Celular parado `{x:0,y:0,z:1}` → `false`; chacoalhada `{x:2,y:1,z:1}` → `true`; exatamente no limite (1,8 g) → `false` |
| 16 | `EncomendaService.regras.test.ts` | `estimar`: 30 cm sem presente → R$ 235–305 e 20 dias |
| 17 | `EncomendaService.regras.test.ts` | `estimar`: presente soma R$ 15 no mínimo e no máximo, e o prazo não muda |
| 18 | `EncomendaService.regras.test.ts` | `validar(criarPedidoInicial())` devolve erro em `nome`, `whatsapp`, `tema` e `ideia` |
| 19 | `EncomendaService.regras.test.ts` | `validar`: ideia com 501 caracteres → mensagem "no máximo 500"; pedido válido → `{}` |
| 20 | `EncomendaService.regras.test.ts` | `criarPedidoInicial('pet', 'm7')` já vem com tema e inspiração |
| 21 | `EncomendaService.regras.test.ts` | `preencherComPerfil`: campo vazio recebe o nome do perfil, e o que a cliente digitou **não** é sobrescrito |
| 22 | `EncomendaService.regras.test.ts` | `preencherComPerfil`: sem mudança, devolve **o mesmo objeto** (`toBe`) |
| 23 | `AuthService.test.ts` | `validar` no modo entrar: e-mail inválido e senha vazia geram erro |
| 24 | `AuthService.test.ts` | `validar` no cadastro: senha com menos de 6 caracteres e confirmação diferente geram erro |
| 25 | `AuthService.test.ts` | `mensagemDeErro({code:'auth/invalid-credential'})` → `'E-mail ou senha incorretos.'`; código desconhecido ou `null` → mensagem geral |
| 26 | `PerfilService.regras.test.ts` | `validar`: nome com 1 letra → erro; WhatsApp vazio é aceito; WhatsApp incompleto → erro |
| 27 | `MandalaService.test.ts` | `filtrarPorBusca`: `'ceu'` encontra "Céu"; busca por cor (`'azul'`); termo vazio devolve tudo |
| 28 | `MandalaService.test.ts` | `filtrarPorTema('todos')` devolve tudo; `'pet'` devolve só pet |
| 29 | `MandalaService.test.ts` | `sortear`: lista vazia → `null`; com 2 itens **nunca** repete o último (rode 20 vezes ou faça `jest.spyOn(Math, 'random')`) |
| 30 | `MandalaService.test.ts` | `obterAcaoDetalhe`: pronta entrega → "Tenho interesse"; portfólio → "Quero uma assim" |
| 31 | `FaqService.test.ts` | `montarSecoes`: agrupa na ordem Encomendas › Pagamento › Cuidados e esconde seção vazia; a busca também olha a resposta |
| 32 | `perfilReducer.test.ts` | `carregou` liga `carregando: false` e guarda o perfil; `falhou` guarda o erro; `apagou` volta ao perfil vazio |

**Commit:** `test: testes unitários das funções puras, validações, reducer e regras dos services`

---

## 6. Testes de integração (meta: 10, sugestão: ~14) em `__tests__/integration/`

Aqui duas ou mais camadas trabalham juntas: **Service → Repository → armazenamento**. Só o que é nativo vira test double.

### Helper `__tests__/helpers/bancoDeTeste.ts`

Um adaptador que imita a parte da API síncrona do `expo-sqlite` que o app usa, por cima do `sql.js`:

```ts
import initSqlJs from 'sql.js';

export async function criarBancoDeTeste() {
  const SQL = await initSqlJs();
  const banco = new SQL.Database(); // em memória: cada teste começa do zero

  function getAllSync<T>(sql: string, params: unknown[] = []): T[] {
    const stmt = banco.prepare(sql);
    stmt.bind(params as never);
    const linhas: T[] = [];
    while (stmt.step()) linhas.push(stmt.getAsObject() as T);
    stmt.free();
    return linhas;
  }

  return {
    execSync: (sql: string) => void banco.exec(sql),
    runSync: (sql: string, params: unknown[] = []) => void banco.run(sql, params as never),
    getAllSync,
    getFirstSync: <T,>(sql: string, params: unknown[] = []) => getAllSync<T>(sql, params)[0] ?? null,
    withTransactionSync(tarefa: () => void) {
      banco.exec('BEGIN');
      try { tarefa(); banco.exec('COMMIT'); } catch (e) { banco.exec('ROLLBACK'); throw e; }
    },
  };
}
```

Uso nos testes. A variável **precisa** começar com `mock` para o `jest.mock` aceitar:

```ts
let mockBanco: Awaited<ReturnType<typeof criarBancoDeTeste>>;
jest.mock('../../src/db/dbConfig', () => ({ getDb: () => mockBanco }));

beforeEach(async () => {
  mockBanco = await criarBancoDeTeste();
  executarMigrations(mockBanco as never); // as migrations de verdade
  await AsyncStorage.clear();
});
```

### Lista de testes

| # | Arquivo | Teste (camadas envolvidas) |
|---|---|---|
| 1 | `migrations.test.ts` | Depois de `executarMigrations`, `PRAGMA user_version` = **2** e a tabela tem as colunas `precoMinimo`, `precoMaximo` e `prazoDias` (`PRAGMA table_info(pedidos)`) |
| 2 | `migrations.test.ts` | Rodar `executarMigrations` duas vezes não dá erro nem duplica nada (idempotente) |
| 3 | `PedidoDao.test.ts` | `inserir` + `listarTodos`: `presente` volta como boolean, `inspiracaoId` ausente volta `null` e `criadoEm` é preenchido pelo banco |
| 4 | `PedidoDao.test.ts` | `listarTodos` ordena do mais novo para o mais antigo (`id DESC`) |
| 5 | `PedidoDao.test.ts` | Um pedido "antigo", inserido com SQL direto sem as colunas da migration 2, volta com `estimativa: null` |
| 6 | `PedidoDao.test.ts` | `excluir(id)` remove só aquele pedido; `excluirTodos` esvazia a tabela |
| 7 | `EncomendaService.enviar.test.ts` | **Service + Repository + DAO + SQLite:** enviar um pedido válido devolve um protocolo `MM-xxxxxx` e grava a linha **sem nome e sem WhatsApp** (conferir que `SELECT *` não tem essas colunas) e com a estimativa que a cliente viu |
| 8 | `EncomendaService.enviar.test.ts` | Enviar um pedido inválido **lança erro e não grava nada** |
| 9 | `EncomendaService.enviar.test.ts` | Depois de um envio que deu certo, o rascunho some do AsyncStorage |
| 10 | `Rascunho.test.ts` | **Service + RascunhoRepository + AsyncStorage:** `salvarRascunho` e depois `carregarRascunho` devolvem o mesmo pedido |
| 11 | `Rascunho.test.ts` | JSON estragado gravado direto no AsyncStorage → `carregarRascunho()` devolve `null` sem quebrar; `tamanhoCm: 99` volta para `30` |
| 12 | `Rascunho.test.ts` | Formulário vazio → a chave é **removida**; nome igual ao do perfil não é repetido no rascunho |
| 13 | `PerfilService.test.ts` | **Service + PerfilRepository + AsyncStorage**, com o `FotoRepository` como double (`jest.mock`): salvar faz `trim` no nome, cidade vazia não é gravada, foto nova → `guardar` é chamado e a antiga é apagada |
| 14 | `apagarMeusDados.test.ts` | Com pedido, rascunho e perfil gravados, `apagarMeusDados()` deixa os três vazios |
| 15 | `AuthRepository.test.ts` | **"API": AuthService + AuthRepository com o Firebase como double** (`jest.mock('firebase/auth')` e `jest.mock('../../src/data/remote/firebase', () => ({ auth: {} }))`): `entrar('  a@b.com ', 's')` chama o Firebase com o e-mail sem espaços e devolve `{ uid, email }` |
| 16 | `AuthRepository.test.ts` | O Firebase rejeita com `{code:'auth/email-already-in-use'}` → `AuthService.mensagemDeErro` traduz para português |
| 17 | `armazenamentoSeguro.test.ts` | Chave do Firebase `firebase:authUser:abc:[DEFAULT]` é gravada no SecureStore como `firebase_authUser_abc__DEFAULT_` e lida de volta |
| 18 | `LocalizacaoService.test.ts` | Com `expo-location` mockado: GPS desligado → `gps-desligado`; permissão negada → `sem-permissao` **e** `getCurrentPositionAsync` nunca é chamado |
| 19 | `LocalizacaoService.test.ts` | Permissão ok, posição mockada **igual às coordenadas do ateliê** e endereço `{ city: 'Muriaé', region: 'MG' }` → `{ tipo: 'ok', cidade: 'Muriaé – MG', distanciaKm: 0 }` |
| 20 | `ImagemService.test.ts` | Com `expo-image-picker` mockado: negado → `sem-permissao`; cancelado → `cancelado`; foto → `{ tipo: 'foto', uri }` |

> ⚠️ O protocolo é `MM-` mais os 6 últimos dígitos do `Date.now()`, e a coluna é `UNIQUE`. Dois `enviar` no mesmo milissegundo, o que só acontece em teste, quebram o `INSERT`. Nos testes que gravam vários pedidos, use o `PedidoDao.inserir` com protocolos diferentes ou `jest.spyOn(Date, 'now')`.

**Commit:** `test: testes de integração de services, repositories, SQLite, AsyncStorage e Firebase`

---

## 7. Testes de UI (meta: 8, sugestão: ~12) em `__tests__/ui/`

Use React Native Testing Library: `render`, `screen`, `fireEvent` (ou `userEvent`) e `waitFor`. Prefira buscar **como a pessoa vê a tela**, com `getByText`, `getByRole('button', { name })` e `getByLabelText`. O app já tem `accessibilityRole` e `accessibilityLabel` em quase tudo.

| # | Arquivo | Teste: renderização, interação e mudança de estado |
|---|---|---|
| 1 | `BotaoPrimario.test.tsx` | Mostra o título; tocar chama `onPress` uma vez |
| 2 | `BotaoPrimario.test.tsx` | Com `carregando`, o título some, o botão fica desabilitado (`accessibilityState.busy`) e tocar **não** chama `onPress` |
| 3 | `CampoTexto.test.tsx` | Mostra o rótulo e a mensagem de erro |
| 4 | `CampoTexto.test.tsx` | Com `mostrarContador` e `maxLength={500}`, digitar "Olá" num componente com estado muda o contador para `3/500` |
| 5 | `Chip.test.tsx` | `selecionado` aparece em `accessibilityState.selected`; tocar chama `onPress` |
| 6 | `MensagemEstado.test.tsx` | `tipo="erro"` mostra "Tentar de novo" e chama o callback; `tipo="vazio"` **não** mostra o botão |
| 7 | `MandalaCard.test.tsx` | Pronta entrega mostra o preço formatado; portfólio mostra o tema ("Pet") |
| 8 | `FotoPerfil.test.tsx` | Sem foto, o rótulo de acessibilidade tem as iniciais (`'Perfil sem foto, iniciais AS'`) |
| 9 | `FaqScreen.test.tsx` | A tela carrega as perguntas (`findByText`); digitar "pagamento" na busca esconde as perguntas de outras seções; tocar numa pergunta mostra a resposta |
| 10 | `EncomendaScreen.test.tsx` | Tocar "Enviar pedido" com o formulário vazio mostra "Confira os campos destacados acima." |
| 11 | `EncomendaScreen.test.tsx` | Escolher "40 cm" muda a faixa de preço exibida e marcar presente soma R$ 15 (estimativa ao vivo) |
| 12 | `PerfilContext.test.tsx` | **Contexto:** dois componentes de teste dentro do `PerfilProvider`. Um chama `salvar({ nome: 'Ana', … })` e o outro, que só lê `usePerfil()`, passa a mostrar "Ana". `usePerfil()` fora do Provider lança erro |

Dicas:

- **Telas** precisam de navegação e Providers. Crie `__tests__/helpers/renderComProviders.tsx`, que envolve o componente em `SessaoProvider`, `PerfilProvider` e `NavigationContainer`. Para a `EncomendaScreen`, passe `navigation` e `route` falsos (`{ navigate: jest.fn() }` e `{ params: {} }`) ou monte o `EncomendaStack`.
- Na `EncomendaScreen`, mocke o `AuthService.observar` para chamar o ouvinte com `null` (ninguém logado). Assim o Firebase não é tocado.
- Telas com dados assíncronos: use `await screen.findByText(...)`.

**Commit:** `test: testes de UI dos componentes, telas e contexto com Testing Library`

---

## 8. Testes end-to-end com Maestro (2) em `e2e/`

### 8.1 Preparar o app (`testID` onde faltar)

- `BotaoPrimario` e `Chip`: aceitar `testID?: string` e repassar ao `Pressable`. O `CampoTexto` já repassa, porque o `...resto` vai para o `TextInput`.
- `MandalaCard`: aceitar `testID`.
- Abas no `AppNavigator`: `options={{ tabBarButtonTestID: 'aba-pedidos' }}` e assim por diante.
- Usar `testID` em: campos do formulário (`campo-nome`, `campo-whatsapp`, `campo-ideia`), `botao-enviar-pedido`, campos de e-mail e senha do Entrar, `botao-entrar` e `botao-ver-meus-pedidos`.

### 8.2 Instalar e rodar

1. Instale o Maestro seguindo a documentação oficial para o seu sistema (`maestro --version` precisa responder). No Windows ele exige o Java instalado.
2. Abra o emulador Android e rode `npx expo start --android`. Isso abre o app no **Expo Go** e faz o `adb reverse` da porta 8081.
3. No **console do Firebase**, crie um usuário só para os testes, por exemplo `e2e@malumandalas.test`. **Não** escreva a senha nos arquivos do repositório.
4. Rode: `maestro test -e EMAIL=e2e@malumandalas.test -e SENHA=suaSenha e2e/`
5. **Vídeo para a apresentação:** `maestro record --local e2e/02-login-encomenda-historico.yaml`. Com `--local`, o vídeo é gerado na máquina, sem ir para a nuvem. Outra opção é gravar a tela do emulador enquanto o `maestro test` roda. O enunciado aceita o E2E apresentado em vídeo.

> Com o Expo Go, o `appId` é o do Expo Go (`host.exp.exponent`) e o app é aberto pelo link `exp://127.0.0.1:8081`. Se a primeira abertura mostrar a tela de boas-vindas do menu de desenvolvedor, o `runFlow` com `when` fecha essa tela.

### 8.3 Fluxo 1: catálogo até a encomenda (`e2e/01-catalogo-ate-encomenda.yaml`)

É o caminho principal de quem ainda não tem conta: ver uma peça do portfólio e pedir uma igual.

```yaml
appId: host.exp.exponent
name: Portfólio → Detalhe → "Quero uma assim" → formulário com o tema escolhido
---
- launchApp
- openLink: exp://127.0.0.1:8081
- runFlow:
    when:
      visible: "Continue"
    commands:
      - tapOn: "Continue"
- extendedWaitUntil:
    visible: "Ver pronta entrega"
    timeout: 60000
- tapOn:
    id: "aba-portfolio"
- tapOn: "Pet"                       # chip do filtro
- tapOn: "Patinhas"                  # mandala do tema pet
- assertVisible: "Quero uma assim"
- tapOn: "Quero uma assim"
- assertVisible: "Encomende a sua"
- assertVisible: "Patinhas.*"        # a inspiração aparece no formulário
- tapOn:
    id: "botao-enviar-pedido"
- assertVisible: "Confira os campos destacados acima."
```

### 8.4 Fluxo 2: login, encomenda e histórico (`e2e/02-login-encomenda-historico.yaml`)

É o fluxo mais importante do app: entrar, enviar uma encomenda e ver o pedido salvo no SQLite.

```yaml
appId: host.exp.exponent
name: Entrar → enviar encomenda → ver em Meus pedidos
env:
  EMAIL: ${EMAIL}
  SENHA: ${SENHA}
---
- launchApp
- openLink: exp://127.0.0.1:8081
- extendedWaitUntil:
    visible: "Ver pronta entrega"
    timeout: 60000
- tapOn:
    id: "aba-perfil"
- runFlow:                           # se já estiver logado, pula o login
    when:
      visible: "Entrar"
    commands:
      - tapOn: { id: "campo-email" }
      - inputText: ${EMAIL}
      - tapOn: { id: "campo-senha" }
      - inputText: ${SENHA}
      - hideKeyboard
      - tapOn: { id: "botao-entrar" }
- tapOn:
    id: "aba-pedidos"
- tapOn: { id: "campo-nome" }
- inputText: "Teste E2E"
- tapOn: { id: "campo-whatsapp" }
- inputText: "32999990000"
- hideKeyboard
- tapOn: "Família"
- scrollUntilVisible:
    element: { id: "campo-ideia" }
- tapOn: { id: "campo-ideia" }
- inputText: "Mandala para a família toda, em tons de verde"
- hideKeyboard
- scrollUntilVisible:
    element: { id: "botao-enviar-pedido" }
- tapOn: { id: "botao-enviar-pedido" }
- extendedWaitUntil:
    visible: "Pedido enviado!"
    timeout: 10000
- tapOn: "Ver meus pedidos"
- assertVisible: "MM-.*"             # o protocolo do pedido que acabou de ser salvo
```

> Ajuste os textos ao que a tela mostra de fato. Por exemplo, se o rótulo do nome no formulário já vier preenchido pelo perfil, use `eraseText` antes. Rode cada fluxo com `maestro test` até passar e só então grave o vídeo.

**Commit:** `test: testes end-to-end com Maestro (catálogo e encomenda com login)`

---

## 9. Correções da avaliação da Parte 1

O enunciado diz: *"aproveite para corrigir o que foi apontado na avaliação anterior."* Liste aqui o que o professor apontou e corrija um item por commit:

- [ ] _(preencher com o retorno da Parte 1)_
- [ ] _(…)_

---

## 10. README atualizado

O enunciado exige que o README explique **como rodar os testes**, **onde está cada tipo de teste**, **quais recursos nativos e permissões o app usa e por quê** e **o que é persistido e onde**. O que mudar:

1. **Corrigir o que está errado hoje:**
   - Em "Persistência e privacidade", a linha *"Senha, token e cartão: Não existem no app. Não há login"*. Agora o login existe: a senha vai direto para o Firebase e nunca é guardada, e o token fica no SecureStore.
   - Em "Diferenças em relação ao material", *"Sem MMKV e sem SecureStore"*. O SecureStore **é** usado para a sessão do Firebase (`armazenamentoSeguro.ts`).
2. **Tabela de persistência completa:**

   | Dado | Onde | Por quê |
   |---|---|---|
   | Histórico de pedidos | SQLite (`pedidos`, migrations 1 e 2) | Lista estruturada que cresce |
   | Rascunho da encomenda | AsyncStorage `@malu-mandalas/rascunho-encomenda` | Um objeto, chave-valor |
   | Perfil (nome, WhatsApp, cidade, caminho da foto) | AsyncStorage `@malu-mandalas/perfil` | Preferência e configuração, chave-valor |
   | Foto do perfil | Arquivo em `documentDirectory/perfil/` (`expo-file-system`) | É binário: o AsyncStorage guarda só o caminho |
   | Sessão do login (tokens do Firebase) | **SecureStore** (Keychain no iOS, Keystore no Android) | Dado sensível nunca vai para o AsyncStorage |
   | Senha | Em lugar nenhum: vai direto para o Firebase | — |
   | Coordenadas do GPS | Não são guardadas, só a cidade | LGPD: guardar o mínimo |

3. **Nova seção "Contexto":** a tabela da Etapa 2 (o que foi para o contexto, quem lê, quem altera e por quê) e o que continuou em `useState`.
4. **Nova seção "Recursos nativos e permissões":**

   | Recurso | Biblioteca | Permissão | Para quê | Se negar ou não existir |
   |---|---|---|---|---|
   | Acelerômetro | `expo-sensors` | Nenhuma | Chacoalhar na Pronta entrega sorteia uma mandala | Sem sensor (ou na web), a dica não aparece; o listener é removido ao sair da tela |
   | Localização | `expo-location` | Só com o app em uso (*when in use*) | Preencher a cidade do perfil e mostrar a distância até o ateliê | Aviso + botão "Abrir Ajustes"; a cidade pode ser digitada |
   | Câmera | `expo-image-picker` | Câmera | Foto do perfil | Aviso + "Abrir Ajustes"; o perfil funciona sem foto |
   | Galeria | `expo-image-picker` | Fotos | Foto do perfil | Igual à câmera |

   Explique também por que a localização é pedida só com o app em uso, que o microfone foi desligado no `app.json` e que cada permissão é pedida **na hora do toque**.
5. **Nova seção "Testes":**
   - Como rodar: `npm test`, `npm run test:unit`, `npm run test:integration`, `npm run test:ui`, `npm run test:coverage`, e o Maestro com o comando completo, o emulador e o usuário de teste.
   - Onde está cada tipo: a árvore de `__tests__/` e `e2e/`.
   - Uma tabela com a **quantidade por tipo**, contada depois de tudo pronto, e o mínimo pedido (20, 10, 8 e 2).
   - **Como foi decidido o que testar em cada nível:** regras puras no unitário (mais rápido e acha mais erro), Service com armazenamento de verdade ou double na integração, comportamento visível na UI, e os dois fluxos de maior valor no E2E.
   - Os doubles usados: mock oficial do AsyncStorage, sql.js no lugar do expo-sqlite, Map no lugar do SecureStore e jest.mock do Firebase, da localização e do image picker.
6. **Atualizar as outras seções:**
   - **"Telas":** agora são 10 (Início, Pronta entrega, Detalhe, Portfólio, Encomenda, Meus pedidos, Dúvidas, Perfil, Entrar e Criar conta).
   - **"Estrutura de pastas":** com `src/context/`, `__tests__/` e `e2e/`.
   - **"Como executar":** com o passo do `.env` do Firebase.
   - **"Tecnologias":** com Firebase, expo-sensors, expo-location, expo-image-picker, expo-secure-store, expo-file-system, Jest, Testing Library, sql.js e Maestro.
   - **"Requisitos do trabalho":** com as linhas da Parte 2.

**Commit:** `docs: README com contexto, recursos nativos, permissões, persistência e testes`

---

## 11. Checklist final antes de enviar o link

- [ ] `npm test` passa **inteiro**. Tire um print ou grave a tela para a apresentação.
- [ ] Contar os testes por pasta: `npm run test:unit`, `npm run test:integration` e `npm run test:ui`. A linha `Tests: N passed` de cada um dá o total. O mínimo é **≥ 20 unitários, ≥ 10 de integração e ≥ 8 de UI**. Anote os números no README.
- [ ] Os 2 fluxos do Maestro passam e o vídeo está gravado.
- [ ] `npx tsc --noEmit` sem erros.
- [ ] O app abre no Expo Go e todas as telas da Parte 1 continuam funcionando.
- [ ] `.env` **não** foi commitado (`git status`); o `.env.example` está atualizado.
- [ ] README revisado: dá para clonar, instalar, rodar o app e rodar os testes só seguindo o README.
- [ ] Tudo commitado e enviado para a **`main`** (`git push origin main`), que é a branch que o professor vai abrir.
- [ ] Link do repositório enviado no Moodle.

---

## 12. Roteiro da apresentação e respostas para a entrevista

**Demonstração, nesta ordem:**

1. Telas da Parte 1: Início, Pronta entrega com busca, Detalhe, Portfólio com filtro, Encomenda com estimativa ao vivo, Dúvidas.
2. Recursos novos:
   - chacoalhar na Pronta entrega;
   - Perfil com câmera ou galeria e cidade pelo GPS, **negando uma permissão** para mostrar o aviso e o botão "Abrir Ajustes";
   - login;
   - envio de encomenda e Meus pedidos;
   - fechar e reabrir o app para mostrar que os dados ficaram;
   - "Apagar meus dados".
3. `npm test` rodando e o vídeo do Maestro.

**Perguntas prováveis e o ponto principal da resposta:**

- **O que foi para o contexto e por quê?**
  - Sessão e perfil, porque são lidos e alterados em abas diferentes.
  - Antes havia um observer feito à mão no `PerfilService` e uma escuta do Firebase por tela. O Context centraliza isso num Provider só.
  - O `value` é memoizado com `useMemo` para não redesenhar quem consome sem necessidade.
  - O perfil usa `useReducer` porque tem vários estados: carregando, carregou, falhou, salvou e apagou.
- **Onde cada dado é persistido?** Use a tabela da Etapa 10. Regra: chave-valor para objeto único, SQLite para lista estruturada, SecureStore para token e arquivo para a foto.
- **Por que migrations desde a primeira versão?** O banco do aparelho já existe e um `CREATE TABLE` editado não roda de novo. O `user_version` diz o que falta, e cada migration roda numa transação.
- **Por que esses recursos nativos?**
  - A cidade e a distância ajudam a combinar a entrega.
  - A foto personaliza o perfil.
  - O chacoalhar é uma forma lúdica de descobrir peças.
  - Todos pedem a permissão na hora do uso, tratam a negação e removem o listener no cleanup.
- **Como decidiu o que testar em cada nível?**
  - Unitário: regras de negócio puras, como preço, prazo, validação, máscara, Haversine e reducer.
  - Integração: Service, Repository e armazenamento, com SQL de verdade no sql.js.
  - UI: o que a pessoa vê e toca.
  - E2E: os dois caminhos que geram valor para o ateliê.
- **O que é um test double e onde você usou?** É qualquer coisa que substitui uma dependência real no teste. Aqui: o mock do AsyncStorage, o sql.js no lugar do expo-sqlite, o Map no lugar do SecureStore, e os `jest.mock` do Firebase, do expo-location e do image picker.

---

## 13. Resumo dos commits sugeridos (na ordem)

1. `feat: SessaoContext com Provider e useSessao em src/context`
2. `feat: PerfilContext com useReducer substitui o observer do PerfilService`
3. `feat: atalho para os Ajustes quando a permissão é negada`
4. `chore: configura Jest com jest-expo, Testing Library e mocks nativos`
5. `test: testes unitários das funções puras, validações, reducer e regras dos services`
6. `test: testes de integração de services, repositories, SQLite, AsyncStorage e Firebase`
7. `test: testes de UI dos componentes, telas e contexto com Testing Library`
8. `feat: testIDs para os testes end-to-end` + `test: testes end-to-end com Maestro`
9. `fix: …`, um por apontamento da Parte 1
10. `docs: README com contexto, recursos nativos, permissões, persistência e testes`
