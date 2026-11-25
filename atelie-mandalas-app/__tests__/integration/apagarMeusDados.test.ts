import AsyncStorage from '@react-native-async-storage/async-storage';
import { executarMigrations } from '../../src/db/migrations';
import { EncomendaService } from '../../src/services/EncomendaService';
import { PerfilService } from '../../src/services/PerfilService';
import { BancoDeTeste, criarBancoDeTeste } from '../helpers/bancoDeTeste';
import { pedidoValido, perfil } from '../helpers/fabricas';

// "Apagar meus dados" passa pelos três armazenamentos: SQLite, AsyncStorage e arquivo da foto.
let mockBanco: BancoDeTeste;
jest.mock('../../src/db/dbConfig', () => ({ getDb: () => mockBanco }));
jest.mock('../../src/data/repositories/FotoRepository', () => ({
  fotoRepository: { guardar: jest.fn(async (uri: string) => uri), apagar: jest.fn() },
}));

beforeEach(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  mockBanco = await criarBancoDeTeste();
  executarMigrations(mockBanco as never);
  await AsyncStorage.clear();
});

afterEach(() => {
  mockBanco.fechar();
  jest.restoreAllMocks();
});

test('apagarMeusDados limpa o histórico, o rascunho e o perfil', async () => {
  await EncomendaService.enviar(pedidoValido());
  await EncomendaService.salvarRascunho(pedidoValido({ nome: 'Rascunho' }), perfil({ nome: '' }));
  await PerfilService.salvar(perfil(), PerfilService.criarPerfilVazio());

  await EncomendaService.apagarMeusDados();

  expect(await EncomendaService.listarPedidos()).toEqual([]);
  expect(await EncomendaService.carregarRascunho()).toBeNull();
  expect(await PerfilService.carregar()).toEqual(PerfilService.criarPerfilVazio());
  expect(await AsyncStorage.getAllKeys()).toEqual([]);
});
