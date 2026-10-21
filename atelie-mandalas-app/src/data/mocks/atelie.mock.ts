import { Atelie } from '../../model/Atelie';

// DADOS FALSOS (mock) do conteúdo da tela Início.
export const ATELIE_MOCK: Atelie = {
  nome: 'Malu Mandalas',
  instagram: '@malu.mandalas',
  whatsapp: '5500000000000', // TROCAR pelo WhatsApp do ateliê: 55 + DDD + número
  slogan: 'mandalas artesanais em pontilhismo, criadas com delicadeza e significado.',
  boasVindas: 'é um prazer ter você aqui!',
  historia: {
    titulo: 'Uma criança que nunca parou de criar',
    texto:
      'Desde pequena, a Malu vivia entre lápis, tintas e papel. A menina cresceu, mas continua aqui: é ela quem escolhe cada cor e pinta, ponto a ponto, as mandalas do ateliê.',
    citacao: 'o criativo é uma criança que insistiu',
    complementoCitacao: 'e há muito dela dentro de mim',
  },
  significado: {
    titulo: 'O que é uma mandala?',
    texto:
      'Mandala vem do sânscrito e quer dizer "círculo". Tudo nasce de um ponto central e se expande em harmonia, por isso ela é usada há séculos como símbolo de equilíbrio, foco e proteção.',
    simbolos: [
      { id: 'centro', nome: 'Centro', descricao: 'onde tudo começa' },
      { id: 'circulo', nome: 'Círculo', descricao: 'unidade e ciclos da vida' },
      { id: 'ponto', nome: 'Ponto', descricao: 'a técnica, um de cada vez' },
    ],
  },
  tecnica: {
    titulo: 'Pontilhismo',
    texto: 'Cada peça é pintada à mão, ponto a ponto. Nenhuma sai igual à outra.',
  },
};