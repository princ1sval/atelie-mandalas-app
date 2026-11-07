import * as SQLite from 'expo-sqlite';
import { executarMigrations } from './migrations';

// Uma única conexão para o app todo: abre na primeira chamada e depois é reaproveitada.
let db: SQLite.SQLiteDatabase | null = null;

// Configuração recomendada para apps mobile (seção 4.5).
// Esses PRAGMAs valem para a conexão, por isso rodam sempre que o banco é aberto.
function configurarDb(banco: SQLite.SQLiteDatabase) {
  banco.execSync('PRAGMA journal_mode = WAL'); // permite ler enquanto escreve e deixa as escritas mais rápidas
  banco.execSync('PRAGMA foreign_keys = ON'); // o SQLite vem com isso desligado (seção 4.4)
  banco.execSync('PRAGMA synchronous = NORMAL'); // equilíbrio entre segurança e velocidade
}

// TEMPORÁRIO: mostra no terminal como o banco está, para testar as etapas. Sai na Etapa 7.
function mostrarDiagnostico(banco: SQLite.SQLiteDatabase) {
  const journal = banco.getFirstSync<{ journal_mode: string }>('PRAGMA journal_mode');
  const chaves = banco.getFirstSync<{ foreign_keys: number }>('PRAGMA foreign_keys');
  const versao = banco.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  console.log(
    `journal_mode=${journal?.journal_mode} | foreign_keys=${chaves?.foreign_keys} | user_version=${versao?.user_version}`,
  );
}

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    const novoBanco = SQLite.openDatabaseSync('malu-mandalas.db'); // cria o arquivo se ainda não existir

    // A configuração vem antes das migrations porque as migrations rodam em transação,
    // e dentro de uma transação esses PRAGMAs não têm efeito.
    configurarDb(novoBanco);
    executarMigrations(novoBanco);

    if (__DEV__) mostrarDiagnostico(novoBanco);

    // Só guarda a conexão depois que tudo deu certo.
    // Assim, se uma migration falhar, a próxima chamada tenta de novo em vez de usar um banco sem migrar.
    db = novoBanco;
  }
  return db;
}
