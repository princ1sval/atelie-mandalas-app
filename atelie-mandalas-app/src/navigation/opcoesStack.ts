import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors, fonts } from '../view/styles/theme';

// Visual do cabeçalho, igual para os dois stacks.
export const opcoesStack: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.fundo },
  headerShadowVisible: false, // sem a linha embaixo do cabeçalho
  headerTintColor: colors.primariaEscura, // cor da seta de voltar
  headerTitleStyle: { fontFamily: fonts.titulo, color: colors.texto },
  contentStyle: { backgroundColor: colors.fundo },
};