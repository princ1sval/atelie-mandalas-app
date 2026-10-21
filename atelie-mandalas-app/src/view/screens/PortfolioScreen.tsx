import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortfolioScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../styles/theme';

// TELA PROVISÓRIA (Etapa 4) — a lista de verdade vem na Etapa 6.
export function PortfolioScreen({ navigation }: PortfolioScreenProps) {
  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <Text style={typography.titulo}>Portfólio</Text>

      <Pressable onPress={() => navigation.navigate('DetalheMandala', { mandalaId: 'enc-patinhas' })}>
        <Text style={styles.link}>Abrir "Patinhas" →</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, gap: spacing.md, padding: spacing.lg, backgroundColor: colors.fundo },
  link: { ...typography.rotulo, color: colors.primariaEscura },
});