import { ConfirmacaoPedido, PedidoEncomenda } from '../../model/Encomenda';
import { esperar } from '../../utils/esperar';

export interface EncomendaRepository {
  enviar(pedido: PedidoEncomenda): Promise<ConfirmacaoPedido>;
}

// Mock: guarda os pedidos só na memória enquanto o app está aberto.
// Na Parte 2 o pedido vai de verdade para uma API ou banco.
const pedidosRecebidos: PedidoEncomenda[] = [];

export const encomendaRepository: EncomendaRepository = {
  async enviar(pedido) {
    await esperar(600);
    pedidosRecebidos.push(pedido);
    const protocolo = `MM-${String(Date.now()).slice(-6)}`;
    return { protocolo };
  },
};