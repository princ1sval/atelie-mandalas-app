import { FaqService } from '../../src/services/FaqService';
import { PerguntaFaq } from '../../src/model/Faq';

const PERGUNTAS: PerguntaFaq[] = [
  { id: '1', categoria: 'cuidados', pergunta: 'Como limpar a peça?', resposta: 'Com pano seco.' },
  { id: '2', categoria: 'encomendas', pergunta: 'Quanto tempo leva?', resposta: 'Cerca de 20 dias.' },
  { id: '3', categoria: 'pagamentoEnvio', pergunta: 'Como pagar?', resposta: 'Pix ou cartão, combinado no WhatsApp.' },
];

describe('FaqService.montarSecoes', () => {
  test('agrupa na ordem Encomendas, Pagamento e envio, Cuidados', () => {
    const secoes = FaqService.montarSecoes(PERGUNTAS, '');
    expect(secoes.map((secao) => secao.title)).toEqual(['Encomendas', 'Pagamento e envio', 'Cuidados com a peça']);
  });

  test('a busca olha também a resposta e esconde as seções que ficaram vazias', () => {
    const secoes = FaqService.montarSecoes(PERGUNTAS, 'PIX');
    expect(secoes).toHaveLength(1);
    expect(secoes[0].title).toBe('Pagamento e envio');
    expect(secoes[0].data.map((p) => p.id)).toEqual(['3']);
  });
});
