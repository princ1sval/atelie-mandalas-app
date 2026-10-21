import { DefaultTheme, Theme } from '@react-navigation/native';
import { colors } from '../view/styles/theme';

// Aplica as cores do ateliê na navegação (fundo das telas, barra de abas, cabeçalhos).
export const temaNavegacao: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primaria,
    background: colors.fundo,
    card: colors.superficie,
    text: colors.texto,
    border: colors.borda,
  },
};