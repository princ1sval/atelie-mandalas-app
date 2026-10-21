import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';
import { radius, spacing } from './spacing';
import { fonts, fontSizes, typography } from './typography';

// Sombra leve para cards: o iOS usa shadow*, o Android usa elevation.
const shadow = Platform.select<ViewStyle>({
  ios: {
    shadowColor: colors.sombra,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {},
});

// Em telas largas (tablet), o conteúdo para nesta largura e fica centralizado.
const larguraMaxima: ViewStyle = { width: '100%', maxWidth: 640, alignSelf: 'center' };

// Porta de entrada do tema: telas e componentes importam tudo daqui.
export { colors, spacing, radius, fonts, fontSizes, typography, shadow, larguraMaxima };