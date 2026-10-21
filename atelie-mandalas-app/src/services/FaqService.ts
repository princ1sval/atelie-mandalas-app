import { CategoriaFaq, PerguntaFaq, SecaoFaq } from '../model/Faq';
import { faqRepository } from '../data/repositories/FaqRepository';
import { normalizarTexto } from '../utils/texto';

// Ordem em que as seções aparecem na tela.
const ORDEM_CATEGORIAS: CategoriaFaq[] = ['encomendas', 'pagamentoEnvio', 'cuidados'];

const NOMES_CATEGORIA: Record<CategoriaFaq, string> = {
  encomendas: 'Encomendas',
  pagamentoEnvio: 'Pagamento e envio',
  cuidados: 'Cuidados com a peça',
};

function listarPerguntas(): Promise<PerguntaFaq[]> {
  return faqRepository.listar();
}

// Filtra pela busca e agrupa por categoria no formato da SectionList.
function montarSecoes(perguntas: PerguntaFaq[], termo: string): SecaoFaq[] {
  const busca = normalizarTexto(termo);
  const filtradas =
    busca === ''
      ? perguntas
      : perguntas.filter((p) => normalizarTexto(`${p.pergunta} ${p.resposta}`).includes(busca));

  return ORDEM_CATEGORIAS.map((categoria) => ({
    title: NOMES_CATEGORIA[categoria],
    data: filtradas.filter((p) => p.categoria === categoria),
  })).filter((secao) => secao.data.length > 0); // esconde seções vazias
}

export const FaqService = {
  listarPerguntas,
  montarSecoes,
};