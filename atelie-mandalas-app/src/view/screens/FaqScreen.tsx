import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../styles/theme';

// TELA PROVISÓRIA (Etapa 4) — as perguntas de verdade vêm na Etapa 6.
export function FaqScreen() {
  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <Text style={typography.titulo}>Dúvidas</Text>
      <Text style={typography.corpo}>Aqui vão as perguntas frequentes.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, gap: spacing.md, padding: spacing.lg, backgroundColor: colors.fundo },
});