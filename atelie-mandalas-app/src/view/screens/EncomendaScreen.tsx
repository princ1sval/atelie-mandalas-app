import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EncomendaScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../styles/theme';

// TELA PROVISÓRIA (Etapa 4) — o formulário de verdade vem na Etapa 6.
export function EncomendaScreen({ route }: EncomendaScreenProps) {
  // Parâmetros opcionais: podem não existir quando a aba é aberta direto
  const tema = route.params?.tema ?? 'nenhum';
  const inspiracao = route.params?.inspiracaoId ?? 'nenhuma';

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <Text style={typography.titulo}>Encomendar</Text>
      <Text style={typography.corpo}>Tema recebido: {tema}</Text>
      <Text style={typography.corpo}>Inspiração: {inspiracao}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, gap: spacing.md, padding: spacing.lg, backgroundColor: colors.fundo },
});