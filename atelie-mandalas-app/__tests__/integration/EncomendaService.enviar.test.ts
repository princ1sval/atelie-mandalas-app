import AsyncStorage from '@react-native-async-storage/async-storage';
import { executarMigrations } from '../../src/db/migrations';
import { EncomendaService } from '../../src/services/EncomendaService';
import { BancoDeTeste, criarBancoDeTeste } from '../helpers/bancoDeTeste';
import { pedidoValido, perfil } from '../helpers/fabricas';

// Integração do envio: EncomendaService → EncomendaRepository → PedidoDao → SQLite,
// e o rascunho pelo RascunhoRepository → AsyncStorage (mock oficial).
let mockBanco: BancoDeTeste;
jest.mock('../../src/db/dbConfig', () => ({ getDb: () => mockBanco }));

const CHAVE_RASCUNHO = '@malu-mandalas/rascunho-encomenda';

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

describe('EncomendaService.enviar', () => {
  test('grava o pedido no histórico, sem nome e sem WhatsApp, com a estimativa que a cliente viu', async () => {
    const pedido = pedidoValido({ tamanhoCm: 40, presente: true });
    const { protocolo } = await EncomendaService.enviar(pedido);

    expect(protocolo).toMatch(/^MM-\d{6}$/);
    const [linha] = mockBanco.getAllSync<Record<string, unknown>>('SELECT * FROM pedidos');
    expect(linha).toMatchObject({ protocolo, tema: 'familia', tamanhoCm: 40, presente: 1 });
    expect(linha).not.toHaveProperty('nome');
    expect(linha).not.toHaveProperty('whatsapp');
    expect(JSON.stringify(linha)).not.toContain('Ana Souza');
    expect(linha).toMatchObject({ precoMinimo: 335, precoMaximo: 425, prazoDias: 25 }); // 40 cm + presente
  });

  test('pedido inválido não é gravado', async () => {
    await expect(EncomendaService.enviar(pedidoValido({ tema: null }))).rejects.toThrow('Pedido inválido');
    expect(await EncomendaService.listarPedidos()).toEqual([]);
  });

  test('depois do envio, o rascunho com nome e WhatsApp sai do aparelho', async () => {
    await EncomendaService.salvarRascunho(pedidoValido({ nome: 'Outra pessoa' }), perfil());
    expect(await AsyncStorage.getItem(CHAVE_RASCUNHO)).not.toBeNull();

    await EncomendaService.enviar(pedidoValido());

    expect(await AsyncStorage.getItem(CHAVE_RASCUNHO)).toBeNull();
    expect(await EncomendaService.listarPedidos()).toHaveLength(1);
  });
});
