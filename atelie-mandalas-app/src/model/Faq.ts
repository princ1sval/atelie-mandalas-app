export type CategoriaFaq = 'encomendas' | 'pagamentoEnvio' | 'cuidados';

export interface PerguntaFaq {
  id: string;
  categoria: CategoriaFaq;
  pergunta: string;
  resposta: string;
}

// Formato que a SectionList espera: um título e a lista (data) daquela seção.
export interface SecaoFaq {
  title: string;
  data: PerguntaFaq[];
}