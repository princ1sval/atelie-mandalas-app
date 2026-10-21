// Paleta da Malu Mandalas (tirada do Instagram do ateliê).
// ÚNICO arquivo do app onde aparecem códigos hexadecimais.

export const colors = {
  // Fundos
  fundo: '#F5F1E3', // fundo das telas (creme)
  superficie: '#FFFCF3', // cards, campos e barra de abas
  fundoImagem: '#EDE7D4', // atrás das fotos das mandalas

  // Cores da marca
  primaria: '#56634A', // verde-sálvia escuro: botões e topo da Início
  primariaEscura: '#3F4A35', // preços e textos de destaque
  salvia: '#8E9C78', // detalhes decorativos (pontinhos)
  salviaClara: '#DCE3CF', // fundo do ícone da aba ativa
  marrom: '#5A3A2B', // sobretítulos e citação da Início
  amarelo: '#F2E3A0', // destaques sobre fundos escuros

  // Textos
  texto: '#2E3127',
  textoSuave: '#5E6456',
  textoSobrePrimaria: '#F6F2DF', // texto creme em cima do verde ou do marrom
  abaInativa: '#6B7062',

  // Bordas e estados
  borda: '#E3DCC6',
  erro: '#A1412F',
  sombra: '#2E3127',
  sobreposicao: 'rgba(46, 49, 39, 0.5)',
} as const;

// Tipo com o nome de todas as cores: 'fundo' | 'superficie' | 'primaria' | ...
export type NomeCor = keyof typeof colors;