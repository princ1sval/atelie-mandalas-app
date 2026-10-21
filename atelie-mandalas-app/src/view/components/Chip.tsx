import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, fontSizes, radius, spacing } from '../styles/theme';

export interface ChipProps {
  rotulo: string;
  selecionado: boolean;
  onPress: () => void;
}

// Botão pequeno de seleção: filtro de temas (Portfólio) e escolha de tema/tamanho (Encomenda).
export function Chip({ rotulo, selecionado, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      hitSlop={6} // aumenta a área de toque sem mudar o tamanho visual
      style={({ pressed }) => [styles.chip, selecionado && styles.chipSelecionado, pressed && styles.pressionado]}
    >
      <Text style={[styles.texto, selecionado && styles.textoSelecionado]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borda,
    backgroundColor: colors.superficie,
  },
  chipSelecionado: { backgroundColor: colors.primaria, borderColor: colors.primaria },
  pressionado: { opacity: 0.8 },
  texto: { fontFamily: fonts.corpoMedio, fontSize: fontSizes.pequeno, color: colors.primariaEscura },
  textoSelecionado: { color: colors.textoSobrePrimaria },
});