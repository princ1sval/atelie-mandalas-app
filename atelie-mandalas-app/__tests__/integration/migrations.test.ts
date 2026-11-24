import { executarMigrations } from '../../src/db/migrations';
import { BancoDeTeste, criarBancoDeTeste } from '../helpers/bancoDeTeste';

// Integração: as migrations de verdade rodando num SQLite de verdade (sql.js, em memória).
let banco: BancoDeTeste;

beforeEach(async () => {
  banco = await criarBancoDeTeste();
  jest.spyOn(console, 'log').mockImplementation(() => {}); // as migrations avisam no console
});

afterEach(() => {
  banco.fechar();
  jest.restoreAllMocks();
});

const versao = () => banco.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version;
const colunas = () => banco.getAllSync<{ name: string }>('PRAGMA table_info(pedidos)').map((c) => c.name);

describe('executarMigrations', () => {
  test('num banco novo, aplica as duas versões e cria as colunas da estimativa', () => {
    executarMigrations(banco as never);
    expect(versao()).toBe(2);
    expect(colunas()).toEqual(expect.arrayContaining(['protocolo', 'tema', 'precoMinimo', 'precoMaximo', 'prazoDias']));
    expect(colunas()).not.toContain('nome'); // nome e WhatsApp nunca vão para o histórico
    expect(colunas()).not.toContain('whatsapp');
  });

  test('rodar de novo não faz nada: cada migration roda uma vez por aparelho', () => {
    executarMigrations(banco as never);
    expect(() => executarMigrations(banco as never)).not.toThrow(); // um ALTER TABLE repetido daria erro
    expect(versao()).toBe(2);
  });

  test('um aparelho que está na versão 1 recebe só a 2, sem perder os pedidos que já tinha', () => {
    // Simula um aparelho que instalou o app antes da migration 2.
    banco.execSync(`CREATE TABLE pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, protocolo TEXT NOT NULL UNIQUE, tema TEXT NOT NULL,
      tamanhoCm INTEGER NOT NULL, cores TEXT NOT NULL DEFAULT '', ideia TEXT NOT NULL,
      presente INTEGER NOT NULL DEFAULT 0, inspiracaoId TEXT,
      criadoEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime')))`);
    banco.execSync(`INSERT INTO pedidos (protocolo, tema, tamanhoCm, ideia) VALUES ('MM-111111', 'pet', 20, 'Antigo')`);
    banco.execSync('PRAGMA user_version = 1');

    executarMigrations(banco as never);

    expect(versao()).toBe(2);
    const [antigo] = banco.getAllSync<{ protocolo: string; precoMinimo: number | null }>('SELECT * FROM pedidos');
    expect(antigo.protocolo).toBe('MM-111111');
    expect(antigo.precoMinimo).toBeNull(); // sem DEFAULT: "não registrada", e não R$ 0
  });
});
