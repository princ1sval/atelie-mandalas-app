import { ConfirmacaoPedido, PedidoEncomenda } from '../../model/Encomenda';
import { PedidoDao } from '../../db/PedidoDao';
import { esperar } from '../../utils/esperar';

export interface EncomendaRepository {
  enviar(pedido: PedidoEncomenda): Promise<ConfirmacaoPedido>;
}

// O envio continua simulado: o app não tem API, então o pedido não chega à Malu.
// O que mudou é que o pedido agora fica gravado no SQLite do aparelho, para o histórico.
// O contrato acima é o mesmo, então Service, ViewModel e tela não precisaram mudar.
export const encomendaRepository: EncomendaRepository = {
  async enviar(pedido) {
    // O Service já valida o tema, mas o tipo aceita null e a coluna tema é NOT NULL.
    if (pedido.tema === null) {
      throw new Error('Pedido sem tema.');
    }

    await esperar(600); // imita o tempo de resposta de uma API
    const protocolo = `MM-${String(Date.now()).slice(-6)}`;

    // Campo a campo, de propósito: com {...pedido}, nome e WhatsApp iriam junto.
    // O histórico não precisa deles (seção 7.3).
    PedidoDao.inserir({
      protocolo,
      tema: pedido.tema,
      tamanhoCm: pedido.tamanhoCm,
      cores: pedido.cores,
      ideia: pedido.ideia,
      presente: pedido.presente,
      inspiracaoId: pedido.inspiracaoId,
    });

    // TEMPORÁRIO: confirma no terminal que o pedido foi gravado, sem mostrar dados dele. Sai na Etapa 7.
    if (__DEV__) console.log(`Pedidos no banco: ${PedidoDao.listarTodos().length}`);

    return { protocolo };
  },
};
