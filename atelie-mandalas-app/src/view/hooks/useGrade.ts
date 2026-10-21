import { useWindowDimensions } from 'react-native';
import { spacing } from '../styles/theme';

const LARGURA_MINIMA_TABLET = 600;

// Calcula quantas colunas cabem e a largura exata de cada card.
// useWindowDimensions é reativo: se a largura da tela mudar, recalcula sozinho.
export function useGrade(margem: number = spacing.lg, espaco: number = spacing.md) {
  const { width } = useWindowDimensions();
  const colunas = width >= LARGURA_MINIMA_TABLET ? 3 : 2;
  const larguraCard = (width - margem * 2 - espaco * (colunas - 1)) / colunas;
  return { colunas, larguraCard };
}