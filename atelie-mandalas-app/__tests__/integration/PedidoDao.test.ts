import { executarMigrations } from '../../src/db/migrations';
import { PedidoDao } from '../../src/db/PedidoDao';
import { BancoDeTeste, criarBancoDeTeste } from '../helpers/bancoDeTeste';
import { pedidoParaSalvar } from '../helpers/fabricas';

// O getDb() do app devolve este banco em memória. O nome começa com "mock" porque o
// jest.mock só aceita variáveis de fora com esse prefixo.
let mockBanco: BancoDeTeste;
jest.mock('../../src/db/dbConfig', () => ({ getDb: () => mockBanco }));

beforeEach(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  mockBanco = await criarBancoDeTeste();
  executarMigrations(mockBanco as never);
});

afterEach(() => {
  mockBanco.fechar();
  jest.restoreAllMocks();
});

describe('PedidoDao com SQLite', () => {
  test('grava e lê o pedido, convertendo 0/1 em boolean e ausência em null', () => {
    PedidoDao.inserir(pedidoParaSalvar({ presente: true }));
    const [salvo] = PedidoDao.listarTodos();
    expect(salvo).toMatchObject({
      protocolo: 'MM-000001',
      tema: 'pet',
      presente: true,
      inspiracaoId: null,
      estimativa: { precoMinimo: 235, precoMaximo: 305, prazoDias: 20 },
    });
    expect(salvo.criadoEm).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/); // preenchido pelo banco
  });

  test('lista do mais novo para o mais antigo', () => {
    PedidoDao.inserir(pedidoParaSalvar({ protocolo: 'MM-000001' }));
    PedidoDao.inserir(pedidoParaSalvar({ protocolo: 'MM-000002' }));
    PedidoDao.inserir(pedidoParaSalvar({ protocolo: 'MM-000003' }));
    expect(PedidoDao.listarTodos().map((p) => p.protocolo)).toEqual(['MM-000003', 'MM-000002', 'MM-000001']);
  });

  test('pedido gravado antes da migration 2 volta com a estimativa null', () => {
    mockBanco.runSync('INSERT INTO pedidos (protocolo, tema, tamanhoCm, ideia) VALUES (?, ?, ?, ?)', [
      'MM-999999',
      'casal',
      20,
      'Pedido antigo',
    ]);
    expect(PedidoDao.listarTodos()[0].estimativa).toBeNull();
  });

  test('texto com aspas é gravado como texto, sem virar SQL (parâmetros "?")', () => {
    const ideia = "Mandala da Joana'); DROP TABLE pedidos; --";
    PedidoDao.inserir(pedidoParaSalvar({ ideia }));
    expect(PedidoDao.listarTodos()[0].ideia).toBe(ideia);
  });

  test('excluir apaga só aquele pedido; excluirTodos esvazia o histórico', () => {
    PedidoDao.inserir(pedidoParaSalvar({ protocolo: 'MM-000001' }));
    PedidoDao.inserir(pedidoParaSalvar({ protocolo: 'MM-000002' }));
    const [maisNovo] = PedidoDao.listarTodos();

    PedidoDao.excluir(maisNovo.id);
    expect(PedidoDao.listarTodos().map((p) => p.protocolo)).toEqual(['MM-000001']);

    PedidoDao.excluirTodos();
    expect(PedidoDao.listarTodos()).toEqual([]);
  });
});
