import { Mandala, NOMES_TEMA, OrigemMandala, TemaEncomenda } from '../model/Mandala';
import { mandalaRepository } from '../data/repositories/MandalaRepository';
import { normalizarTexto } from '../utils/texto';

// 'todos' é uma opção a mais do filtro do Portfólio.
export type FiltroTema = TemaEncomenda | 'todos';

// O botão principal do Detalhe muda conforme a origem da mandala.
export interface AcaoDetalhe {
  tipo: 'tenhoInteresse' | 'queroUmaAssim';
  rotulo: string;
  ajuda: string;
}

async function listarPorOrigem(origem: OrigemMandala): Promise<Mandala[]> {
  const todas = await mandalaRepository.listar();
  return todas.filter((mandala) => mandala.origem === origem);
}

function listarProntaEntrega(): Promise<Mandala[]> {
  return listarPorOrigem('prontaEntrega');
}

function listarPortfolio(): Promise<Mandala[]> {
  return listarPorOrigem('encomenda');
}

function buscarPorId(id: string): Promise<Mandala | undefined> {
  return mandalaRepository.buscarPorId(id);
}

// Busca pelo nome ou pelas cores, sem diferenciar acento e maiúscula.
function filtrarPorBusca(mandalas: Mandala[], termo: string): Mandala[] {
  const busca = normalizarTexto(termo);
  if (busca === '') return mandalas;

  return mandalas.filter((mandala) => {
    const textoPesquisavel = normalizarTexto([mandala.nome, ...mandala.cores].join(' '));
    return textoPesquisavel.includes(busca);
  });
}

function filtrarPorTema(mandalas: Mandala[], filtro: FiltroTema): Mandala[] {
  if (filtro === 'todos') return mandalas;
  return mandalas.filter((mandala) => mandala.tema === filtro);
}

// Opções dos chips de filtro do Portfólio: "Todos" + cada tema.
function opcoesDeFiltro(): { valor: FiltroTema; rotulo: string }[] {
  const temas = Object.entries(NOMES_TEMA).map(([valor, rotulo]) => ({
    valor: valor as TemaEncomenda,
    rotulo,
  }));
  return [{ valor: 'todos', rotulo: 'Todos' }, ...temas];
}

// "Pronta entrega" ou "Encomenda · Pet"
function descreverOrigem(mandala: Mandala): string {
  if (mandala.origem === 'prontaEntrega') return 'Pronta entrega';
  return mandala.tema ? `Encomenda · ${NOMES_TEMA[mandala.tema]}` : 'Encomenda';
}

// Regra do Detalhe: pronta entrega -> "Tenho interesse"; portfólio -> "Quero uma assim".
function obterAcaoDetalhe(mandala: Mandala): AcaoDetalhe {
  if (mandala.origem === 'prontaEntrega') {
    return {
      tipo: 'tenhoInteresse',
      rotulo: 'Tenho interesse',
      ajuda: 'Abre uma conversa com o ateliê no WhatsApp',
    };
  }
  return {
    tipo: 'queroUmaAssim',
    rotulo: 'Quero uma assim',
    ajuda: mandala.tema
      ? `Leva ao pedido com o tema ${NOMES_TEMA[mandala.tema]} já escolhido`
      : 'Leva ao formulário de encomenda',
  };
}

export const MandalaService = {
  listarProntaEntrega,
  listarPortfolio,
  buscarPorId,
  filtrarPorBusca,
  filtrarPorTema,
  opcoesDeFiltro,
  descreverOrigem,
  obterAcaoDetalhe,
};