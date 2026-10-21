import {
  ConfirmacaoPedido,
  ErrosPedido,
  EstimativaEncomenda,
  PedidoEncomenda,
  TamanhoEncomenda,
} from '../model/Encomenda';
import { TemaEncomenda } from '../model/Mandala';
import { encomendaRepository } from '../data/repositories/EncomendaRepository';
import { apenasDigitos } from '../utils/texto';
import { ehTelefoneValido } from '../utils/validators';

export const TAMANHOS_ENCOMENDA: TamanhoEncomenda[] = [20, 30, 40];
export const LIMITE_IDEIA = 500;

// Tabela de preço e prazo por tamanho (valores provisórios: confirmar com a Malu).
const TABELA_POR_TAMANHO: Record<TamanhoEncomenda, EstimativaEncomenda> = {
  20: { precoMinimo: 150, precoMaximo: 200, prazoDias: 15 },
  30: { precoMinimo: 235, precoMaximo: 305, prazoDias: 20 },
  40: { precoMinimo: 320, precoMaximo: 410, prazoDias: 25 },
};
const ADICIONAL_PRESENTE = 15; // embalagem especial com cartão

// Formulário começa vazio; tema e inspiração podem vir do Portfólio ("Quero uma assim").
function criarPedidoInicial(tema?: TemaEncomenda, inspiracaoId?: string): PedidoEncomenda {
  return {
    nome: '',
    whatsapp: '',
    tema: tema ?? null,
    tamanhoCm: 30,
    cores: '',
    ideia: '',
    presente: false,
    inspiracaoId,
  };
}

function estimar(pedido: PedidoEncomenda): EstimativaEncomenda {
  const tabela = TABELA_POR_TAMANHO[pedido.tamanhoCm];
  const adicional = pedido.presente ? ADICIONAL_PRESENTE : 0;
  return {
    precoMinimo: tabela.precoMinimo + adicional,
    precoMaximo: tabela.precoMaximo + adicional,
    prazoDias: tabela.prazoDias,
  };
}

// Devolve um objeto só com os campos que têm erro. Vazio = pedido válido.
function validar(pedido: PedidoEncomenda): ErrosPedido {
  const erros: ErrosPedido = {};

  if (pedido.nome.trim().length < 2) {
    erros.nome = 'Informe seu nome.';
  }
  if (!ehTelefoneValido(pedido.whatsapp)) {
    erros.whatsapp = 'Informe um WhatsApp com DDD.';
  }
  if (pedido.tema === null) {
    erros.tema = 'Escolha um tema.';
  }
  if (pedido.ideia.trim().length < 10) {
    erros.ideia = 'Conte um pouco mais sobre a sua ideia.';
  } else if (pedido.ideia.length > LIMITE_IDEIA) {
    erros.ideia = `Use no máximo ${LIMITE_IDEIA} caracteres.`;
  }

  return erros;
}

function temErros(erros: ErrosPedido): boolean {
  return Object.keys(erros).length > 0;
}

async function enviar(pedido: PedidoEncomenda): Promise<ConfirmacaoPedido> {
  if (temErros(validar(pedido))) {
    throw new Error('Pedido inválido: confira os campos destacados.');
  }
  // Limpa os dados antes de mandar para a camada de dados.
  return encomendaRepository.enviar({
    ...pedido,
    nome: pedido.nome.trim(),
    whatsapp: apenasDigitos(pedido.whatsapp),
  });
}

export const EncomendaService = {
  criarPedidoInicial,
  estimar,
  validar,
  temErros,
  enviar,
};