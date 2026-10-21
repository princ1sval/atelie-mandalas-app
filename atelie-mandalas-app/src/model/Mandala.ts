// De onde a mandala vem: peça pronta à venda ou encomenda já entregue (portfólio).
export type OrigemMandala = 'prontaEntrega' | 'encomenda';

// Temas possíveis de uma encomenda.
export type TemaEncomenda = 'familia' | 'pet' | 'homenagem' | 'casal' | 'outro';

// Nome de cada tema para mostrar na tela.
export const NOMES_TEMA: Record<TemaEncomenda, string> = {
  familia: 'Família',
  pet: 'Pet',
  homenagem: 'Homenagem',
  casal: 'Casal',
  outro: 'Outro',
};

// Imagem local (require devolve um número) ou, na Parte 2, um endereço da internet.
export type ImagemMandala = number | { uri: string };

export interface Mandala {
  id: string;
  nome: string;
  origem: OrigemMandala;
  subtitulo: string; // frase de destaque do detalhe
  descricao: string;
  tecnica: string;
  base: string; // material onde foi pintada
  tamanhoCm: number; // diâmetro
  cores: string[]; // usadas na busca "por nome ou cor"
  preco?: number; // só pronta entrega
  tema?: TemaEncomenda; // só portfólio (encomendas)
  imagem: ImagemMandala;
  descricaoImagem: string; // texto para leitor de tela (acessibilidade)
}