import { StyleSheet } from 'react-native';
import { colors } from './colors';

// Nomes das fontes carregadas no App.tsx.
// Precisam ser IGUAIS às chaves passadas para o useFonts.
export const fonts = {
  tituloLeve: 'Fraunces_300Light',
  titulo: 'Fraunces_400Regular',
  corpoLeve: 'Poppins_300Light',
  corpo: 'Poppins_400Regular',
  corpoMedio: 'Poppins_500Medium',
  corpoForte: 'Poppins_600SemiBold',
} as const;

export const fontSizes = {
  legenda: 11,
  pequeno: 13,
  corpo: 15,
  destaque: 17,
  secao: 22,
  titulo: 32,
} as const;

// Estilos de texto prontos para reaproveitar em telas e componentes.
export const typography = StyleSheet.create({
  titulo: {
    fontFamily: fonts.titulo,
    fontSize: fontSizes.titulo,
    lineHeight: 38,
    color: colors.texto,
  },
  secao: {
    fontFamily: fonts.titulo,
    fontSize: fontSizes.secao,
    lineHeight: 28,
    color: colors.texto,
  },
  sobretitulo: {
    fontFamily: fonts.corpoForte,
    fontSize: fontSizes.legenda,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.marrom,
  },
  corpo: {
    fontFamily: fonts.corpo,
    fontSize: fontSizes.corpo,
    lineHeight: 24,
    color: colors.textoSuave,
  },
  pequeno: {
    fontFamily: fonts.corpo,
    fontSize: fontSizes.pequeno,
    lineHeight: 19,
    color: colors.textoSuave,
  },
  rotulo: {
    fontFamily: fonts.corpoMedio,
    fontSize: fontSizes.pequeno,
    color: colors.texto,
  },
});