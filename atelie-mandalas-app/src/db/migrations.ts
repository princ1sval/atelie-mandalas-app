import * as SQLite from 'expo-sqlite';

// Migrations (seção 4.3 do material): scripts SQL que evoluem o banco aos poucos.
// O banco do aparelho já existe, então mudar um CREATE TABLE antigo não teria efeito.
// Para mudar o banco, acrescente uma versão nova no fim da lista. Nunca edite uma versão já usada.
interface Migration {
  versao: number;
  descricao: string;
  sql: string;
}

const migrations: Migration[] = [
  {
    versao: 1,
    descricao: 'Cria a tabela pedidos',
    // Nome e WhatsApp ficam de fora de propósito: o histórico não precisa deles (seção 7.3).
    // "presente" é INTEGER porque o SQLite não tem boolean: 0 = não, 1 = sim (seção 4.2).
    // "localtime" grava a hora do aparelho. Sem ele, a data ficaria em UTC (exemplo da seção 10).
    sql: `
      CREATE TABLE IF NOT EXISTS pedidos (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        protocolo    TEXT    NOT NULL UNIQUE,
        tema         TEXT    NOT NULL,
        tamanhoCm    INTEGER NOT NULL,
        cores        TEXT    NOT NULL DEFAULT '',
        ideia        TEXT    NOT NULL,
        presente     INTEGER NOT NULL DEFAULT 0,
        inspiracaoId TEXT,
        criadoEm     TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
      )
    `,
  },
];

export function executarMigrations(db: SQLite.SQLiteDatabase) {
  // user_version é um número guardado no próprio arquivo do banco (seção 4.4).
  // Ele começa em 0 e diz qual foi a última migration aplicada neste aparelho.
  const resultado = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const versaoAtual = resultado?.user_version ?? 0;

  // Só roda o que este aparelho ainda não tem.
  const pendentes = migrations.filter((migration) => migration.versao > versaoAtual);

  for (const migration of pendentes) {
    // Transação: ou a migration inteira é aplicada, ou nada muda.
    // O material não usa transação aqui. Sem ela, uma falha no meio deixaria o banco pela metade.
    db.withTransactionSync(() => {
      db.execSync(migration.sql);
      db.execSync(`PRAGMA user_version = ${migration.versao}`);
    });
    console.log(`Migration ${migration.versao} executada: ${migration.descricao}`);
  }
}
