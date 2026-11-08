import { EstimativaEncomenda, TamanhoEncomenda } from '../model/Encomenda';
import { TemaEncomenda } from '../model/Mandala';
import { getDb } from './dbConfig';

// DAO (Data Access Object): reúne as consultas da tabela pedidos, para o resto do app não escrever SQL.
// O nome segue o ProdutoDao da seção 2.4, e as chamadas usam a API síncrona da seção 4.2.

// O que é preciso para gravar um pedido.
// Não tem nome nem WhatsApp: o histórico não precisa deles (seção 7.3).
export interface PedidoParaSalvar {
  protocolo: string;
  tema: TemaEncomenda;
  tamanhoCm: TamanhoEncomenda;
  cores: string;
  ideia: string;
  presente: boolean;
  inspiracaoId?: string;
  estimativa: EstimativaEncomenda; // preço e prazo que a cliente viu na tela (migration 2)
}

// Uma linha da tabela pedidos, do jeito que o SQLite devolve.
export interface LinhaPedido {
  id: number;
  protocolo: string;
  tema: string;
  tamanhoCm: number;
  cores: string;
  ideia: string;
  presente: number; // 0 = não, 1 = sim
  inspiracaoId: string | null;
  criadoEm: string; // "AAAA-MM-DD HH:MM:SS", na hora do aparelho
  // Colunas da migration 2: ficam NULL nos pedidos gravados antes dela.
  precoMinimo: number | null;
  precoMaximo: number | null;
  prazoDias: number | null;
}

export const PedidoDao = {
  inserir(pedido: PedidoParaSalvar): void {
    // Cada "?" recebe um valor da lista, na mesma ordem (seção 4.2).
    // Os valores vão separados do comando, então o texto digitado nunca vira SQL.
    getDb().runSync(
      `INSERT INTO pedidos (protocolo, tema, tamanhoCm, cores, ideia, presente, inspiracaoId,
                            precoMinimo, precoMaximo, prazoDias)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pedido.protocolo,
        pedido.tema,
        pedido.tamanhoCm,
        pedido.cores,
        pedido.ideia,
        pedido.presente ? 1 : 0, // o SQLite não tem boolean, como a coluna "concluida" da seção 4.2
        pedido.inspiracaoId ?? null, // undefined não existe no SQLite: sem inspiração, grava NULL
        pedido.estimativa.precoMinimo,
        pedido.estimativa.precoMaximo,
        pedido.estimativa.prazoDias,
      ],
    );
    // id e criadoEm ficam de fora: o banco preenche sozinho (AUTOINCREMENT e DEFAULT).
  },

  // Do mais novo para o mais antigo. A seção 4.2 ordena pela data, mas dois pedidos
  // no mesmo segundo teriam o mesmo criadoEm. O id nunca se repete e sempre cresce.
  listarTodos(): LinhaPedido[] {
    return getDb().getAllSync<LinhaPedido>('SELECT * FROM pedidos ORDER BY id DESC');
  },
};
