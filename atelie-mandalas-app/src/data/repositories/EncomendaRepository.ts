import { ConfirmacaoPedido, EstimativaEncomenda, PedidoEncomenda } from '../../model/Encomenda';
import { PedidoDao } from '../../db/PedidoDao';
import { esperar } from '../../utils/esperar';

export interface EncomendaRepository {
  // A estimativa vem pronta do Service: calcular preço e prazo é regra de negócio.
  enviar(pedido: PedidoEncomenda, estimativa: EstimativaEncomenda): Promise<ConfirmacaoPedido>;
}

// O envio continua simulado: o app não tem API, então o pedido não chega à Malu.
// O que mudou é que o pedido agora fica gravado no SQLite do aparelho, para o histórico,
// junto com a estimativa de preço e prazo que a cliente viu na tela.
export const encomendaRepository: EncomendaRepository = {
  async enviar(pedido, estimativa) {
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
      estimativa,
    });

    // TEMPORÁRIO: confirma no terminal o que foi gravado, lendo de volta do banco e sem dados
    // pessoais: só a quantidade e a estimativa do último pedido. Sai na Etapa 7.
    if (__DEV__) {
      const pedidos = PedidoDao.listarTodos(); // o mais novo vem primeiro
      const ultimo = pedidos[0];
      console.log(
        `Pedidos no banco: ${pedidos.length} | último: R$ ${ultimo.precoMinimo} a R$ ${ultimo.precoMaximo}, ${ultimo.prazoDias} dias`,
      );
    }

    return { protocolo };
  },
};
