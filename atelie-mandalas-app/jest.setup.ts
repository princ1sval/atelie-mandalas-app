// Mocks globais das bibliotecas nativas. No Jest não há celular: o que depende do
// aparelho (armazenamento, Keychain, banco) precisa de um substituto em memória.

// AsyncStorage: mock oficial do pacote, guarda na memória.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Safe area: mock oficial do pacote (insets zerados).
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// SecureStore: um Map na memória no lugar do Keychain/Keystore.
jest.mock('expo-secure-store', () => {
  const dados = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (chave: string) => dados.get(chave) ?? null),
    setItemAsync: jest.fn(async (chave: string, valor: string) => {
      dados.set(chave, valor);
    }),
    deleteItemAsync: jest.fn(async (chave: string) => {
      dados.delete(chave);
    }),
  };
});

// Banco: as telas importam o PedidoDao, que importa o expo-sqlite. Nenhum teste usa o banco
// do celular: os testes de banco usam o SQLite em memória do __tests__/helpers/bancoDeTeste.ts.
jest.mock('expo-sqlite', () => ({ openDatabaseSync: jest.fn() }));

// Firebase sem .env nos testes: ninguém logado. Os testes do AuthRepository trocam por um double.
jest.mock('./src/data/remote/firebase', () => ({ auth: null, firebaseConfigurado: false }));

// Os repositories imitam o tempo de uma API com esperar(). Nos testes, sem espera.
jest.mock('./src/utils/esperar', () => ({ esperar: () => Promise.resolve() }));
