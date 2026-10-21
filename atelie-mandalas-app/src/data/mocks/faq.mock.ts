import { PerguntaFaq } from '../../model/Faq';

// DADOS FALSOS (mock) — confirmar as respostas com a Malu.
export const FAQ_MOCK: PerguntaFaq[] = [
  {
    id: 'faq-prazo',
    categoria: 'encomendas',
    pergunta: 'Quanto tempo leva uma encomenda?',
    resposta:
      'Depende do tamanho e dos detalhes da peça. Ao enviar o pedido você já vê uma estimativa de prazo, e a Malu confirma tudo com você antes de começar.',
  },
  {
    id: 'faq-foto',
    categoria: 'encomendas',
    pergunta: 'Posso mandar uma foto como referência?',
    resposta:
      'Pode e deve! Fotos ajudam a entender cores e detalhes. Depois de enviar o pedido, é só mandar as imagens pelo WhatsApp.',
  },
  {
    id: 'faq-cores',
    categoria: 'encomendas',
    pergunta: 'Dá para escolher as cores?',
    resposta:
      'Sim. No pedido tem um campo para as cores preferidas, e a paleta final é combinada com você antes da pintura.',
  },
  {
    id: 'faq-pagamento',
    categoria: 'pagamentoEnvio',
    pergunta: 'Quais são as formas de pagamento?',
    resposta: 'Pix ou cartão. Os detalhes do pagamento são combinados pelo WhatsApp.',
  },
  {
    id: 'faq-envio',
    categoria: 'pagamentoEnvio',
    pergunta: 'Vocês enviam para outras cidades?',
    resposta:
      'Sim, enviamos para todo o Brasil com embalagem reforçada. Também dá para combinar a retirada da peça.',
  },
  {
    id: 'faq-limpeza',
    categoria: 'cuidados',
    pergunta: 'Como limpar minha mandala?',
    resposta:
      'Use um pano macio e seco ou um espanador. Evite água e produtos de limpeza, que podem tirar o brilho da tinta.',
  },
  {
    id: 'faq-sol',
    categoria: 'cuidados',
    pergunta: 'Posso deixar a peça pegando sol?',
    resposta: 'O ideal é evitar sol direto e umidade: com o tempo, a luz forte desbota as cores.',
  },
];