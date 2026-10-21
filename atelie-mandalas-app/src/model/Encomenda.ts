import { TemaEncomenda } from './Mandala';

export type TamanhoEncomenda = 20 | 30 | 40;

// Tudo o que o cliente preenche no formulário de encomenda.
export interface PedidoEncomenda {
  nome: string;
  whatsapp: string;
  tema: TemaEncomenda | null; // null = ainda não escolheu
  tamanhoCm: TamanhoEncomenda;
  cores: string;
  ideia: string;
  presente: boolean;
  inspiracaoId?: string; // id da mandala do portfólio que inspirou o pedido
}

// Mensagem de erro por campo. Ex.: { nome: 'Informe seu nome' }
export type ErrosPedido = Partial<Record<keyof PedidoEncomenda, string>>;

export interface EstimativaEncomenda {
  precoMinimo: number;
  precoMaximo: number;
  prazoDias: number;
}

// O que o "servidor" devolve quando o pedido é recebido.
export interface ConfirmacaoPedido {
  protocolo: string;
}