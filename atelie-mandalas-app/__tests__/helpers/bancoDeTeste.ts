import initSqlJs, { SqlValue } from 'sql.js';

// Test double do banco: um SQLite de verdade, compilado para WebAssembly (sql.js), rodando
// na memória do Node. Imita só a parte da API síncrona do expo-sqlite que o app usa
// (execSync, runSync, getAllSync, getFirstSync e withTransactionSync).
// Assim os testes rodam o SQL real das migrations e do PedidoDao, sem celular.
export async function criarBancoDeTeste() {
  const SQL = await initSqlJs();
  const banco = new SQL.Database(); // em memória: cada teste começa com um banco vazio

  function getAllSync<T>(sql: string, parametros: unknown[] = []): T[] {
    const consulta = banco.prepare(sql);
    consulta.bind(parametros as SqlValue[]);
    const linhas: T[] = [];
    while (consulta.step()) linhas.push(consulta.getAsObject() as T);
    consulta.free();
    return linhas;
  }

  return {
    execSync(sql: string) {
      banco.exec(sql);
    },
    runSync(sql: string, parametros: unknown[] = []) {
      banco.run(sql, parametros as SqlValue[]);
    },
    getAllSync,
    getFirstSync<T>(sql: string, parametros: unknown[] = []): T | null {
      return getAllSync<T>(sql, parametros)[0] ?? null;
    },
    withTransactionSync(tarefa: () => void) {
      banco.exec('BEGIN');
      try {
        tarefa();
        banco.exec('COMMIT');
      } catch (erro) {
        banco.exec('ROLLBACK');
        throw erro;
      }
    },
    fechar() {
      banco.close();
    },
  };
}

export type BancoDeTeste = Awaited<ReturnType<typeof criarBancoDeTeste>>;
