import {
  ConfirmacaoPedido,
  ErrosPedido,
  EstimativaEncomenda,
  PedidoEncomenda,
  PedidoSalvo,
  TamanhoEncomenda,
} from '../model/Encomenda';
import { NOMES_TEMA, TemaEncomenda } from '../model/Mandala';
import { Perfil } from '../model/Perfil';
import { encomendaRepository } from '../data/repositories/EncomendaRepository';
import { rascunhoRepository } from '../data/repositories/RascunhoRepository';
import { PerfilService } from './PerfilService';
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

// A cliente pode apagar um pedido do histórico a qualquer momento (seção 7.3).
function excluirPedido(id: number): Promise<void> {
  return encomendaRepository.excluir(id);
}

// "Apagar meus dados": tudo o que o app guardou sobre a cliente neste aparelho (seção 7.3).
// O rascunho e o perfil vão primeiro porque têm nome, WhatsApp e foto, a mesma lógica da 9.4
// de limpar o mais sensível antes. O catálogo fica: ele é do app, não da cliente (seção 9.3).
async function apagarMeusDados(): Promise<void> {
  await rascunhoRepository.limpar();
  await PerfilService.apagar(); // o perfil e o arquivo da foto
  await encomendaRepository.excluirTodos();
}

// O formulário vem preenchido com o perfil, sem apagar o que a cliente digitou.
// Um campo recebe o valor do perfil quando está vazio ou quando ainda mostra o valor antigo
// do perfil (a cliente trocou o nome no Perfil e o formulário acompanha).
function preencherComPerfil(pedido: PedidoEncomenda, perfil: Perfil, anterior?: Perfil): PedidoEncomenda {
  const escolher = (noFormulario: string, doPerfil: string, antigo?: string) =>
    noFormulario.trim() === '' || noFormulario === antigo ? doPerfil : noFormulario;

  const nome = escolher(pedido.nome, perfil.nome, anterior?.nome);
  const whatsapp = escolher(pedido.whatsapp, perfil.whatsapp, anterior?.whatsapp);
  // Nada mudou: devolve o mesmo objeto, para a tela não redesenhar à toa.
  if (nome === pedido.nome && whatsapp === pedido.whatsapp) return pedido;
  return { ...pedido, nome, whatsapp };
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

// Nome e WhatsApp iguais aos do perfil já estão guardados no perfil: o rascunho não os repete
// (seção 7.3, guardar só o necessário). Ao reabrir o app, eles voltam pelo preencherComPerfil.
function semDadosDoPerfil(pedido: PedidoEncomenda, perfil: Perfil): PedidoEncomenda {
  return {
    ...pedido,
    nome: pedido.nome === perfil.nome ? '' : pedido.nome,
    whatsapp: pedido.whatsapp === perfil.whatsapp ? '' : pedido.whatsapp,
  };
}

// Guarda o formulário. Se não sobrar nada para guardar, apaga a chave: nada de guardar dado à toa (seção 7.3).
async function salvarRascunho(pedido: PedidoEncomenda, perfil: Perfil): Promise<void> {
  const paraGuardar = semDadosDoPerfil(pedido, perfil);
  if (estaVazio(paraGuardar)) {
    await rascunhoRepository.limpar();
  } else {
    await rascunhoRepository.salvar(paraGuardar);
  }
}

export const EncomendaService = {
  criarPedidoInicial,
  estimar,
  validar,
  temErros,
  enviar,
  listarPedidos,
  excluirPedido,
  apagarMeusDados,
  preencherComPerfil,
  carregarRascunho,
  salvarRascunho,
};