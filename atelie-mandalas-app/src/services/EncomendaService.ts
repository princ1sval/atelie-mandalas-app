import {
  ConfirmacaoPedido,
  ErrosPedido,
  EstimativaEncomenda,
  PedidoEncomenda,
  PedidoSalvo,
  TamanhoEncomenda,
} from '../model/Encomenda';
import { NOMES_TEMA, TemaEncomenda } from '../model/Mandala';
import { encomendaRepository } from '../data/repositories/EncomendaRepository';
import { rascunhoRepository } from '../data/repositories/RascunhoRepository';
import { apenasDigitos } from '../utils/texto';
import { ehTelefoneValido } from '../utils/validators';

export const TAMANHOS_ENCOMENDA: TamanhoEncomenda[] = [20, 30, 40];
export const LIMITE_IDEIA = 500;
const TEMAS = Object.keys(NOMES_TEMA) as TemaEncomenda[];

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
  // A estimativa vai junto: a tabela de preços é provisória e pode mudar, e o histórico
  // precisa guardar o valor que a cliente viu na tela, e não o da tabela de amanhã.
  const confirmacao = await encomendaRepository.enviar(
    {
      ...pedido,
      nome: pedido.nome.trim(),
      whatsapp: apenasDigitos(pedido.whatsapp),
    },
    estimar(pedido),
  );

  // Pedido enviado: o rascunho, com nome e WhatsApp, já não serve para nada (seção 7.3).
  // Se apagar falhar, o envio continua valendo: o formulário vazio apaga a chave no próximo salvamento.
  try {
    await rascunhoRepository.limpar();
  } catch {
    // ver o comentário acima
  }
  return confirmacao;
}

// Histórico de pedidos deste aparelho, do mais novo para o mais antigo.
function listarPedidos(): Promise<PedidoSalvo[]> {
  return encomendaRepository.listar();
}

// ---------- Rascunho do formulário (seção 3.1) ----------

// Formulário igual ao inicial: não há nada para guardar.
function estaVazio(pedido: PedidoEncomenda): boolean {
  const inicial = criarPedidoInicial();
  return (
    pedido.nome.trim() === '' &&
    pedido.whatsapp.trim() === '' &&
    pedido.tema === inicial.tema &&
    pedido.tamanhoCm === inicial.tamanhoCm &&
    pedido.cores.trim() === '' &&
    pedido.ideia.trim() === '' &&
    pedido.presente === inicial.presente &&
    !pedido.inspiracaoId
  );
}

// O rascunho vem do armazenamento do aparelho, então cada campo é conferido antes de voltar ao
// formulário. Um valor estranho, como um tamanho que não existe, volta ao padrão em vez de quebrar a tela.
function restaurarRascunho(salvo: Partial<PedidoEncomenda>): PedidoEncomenda {
  const inicial = criarPedidoInicial();
  const texto = (valor: unknown, padrao: string) => (typeof valor === 'string' ? valor : padrao);
  return {
    nome: texto(salvo.nome, inicial.nome),
    whatsapp: texto(salvo.whatsapp, inicial.whatsapp),
    tema: TEMAS.includes(salvo.tema as TemaEncomenda) ? (salvo.tema as TemaEncomenda) : inicial.tema,
    tamanhoCm: TAMANHOS_ENCOMENDA.includes(salvo.tamanhoCm as TamanhoEncomenda)
      ? (salvo.tamanhoCm as TamanhoEncomenda)
      : inicial.tamanhoCm,
    cores: texto(salvo.cores, inicial.cores),
    ideia: texto(salvo.ideia, inicial.ideia),
    presente: salvo.presente === true,
    inspiracaoId: typeof salvo.inspiracaoId === 'string' ? salvo.inspiracaoId : undefined,
  };
}

// O rascunho salvo, já conferido, ou null quando não há nenhum.
async function carregarRascunho(): Promise<PedidoEncomenda | null> {
  const salvo = await rascunhoRepository.carregar();
  return salvo ? restaurarRascunho(salvo) : null;
}

// Guarda o formulário. Se ele estiver vazio, apaga a chave: nada de guardar dado à toa (seção 7.3).
async function salvarRascunho(pedido: PedidoEncomenda): Promise<void> {
  if (estaVazio(pedido)) {
    await rascunhoRepository.limpar();
  } else {
    await rascunhoRepository.salvar(pedido);
  }
}

export const EncomendaService = {
  criarPedidoInicial,
  estimar,
  validar,
  temErros,
  enviar,
  listarPedidos,
  carregarRascunho,
  salvarRascunho,
};