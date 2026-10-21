import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProntaEntregaScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../styles/theme';

// TELA PROVISÓRIA (Etapa 4) — a lista de verdade vem na Etapa 6.
export function ProntaEntregaScreen({ navigation }: ProntaEntregaScreenProps) {
  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <Text style={typography.titulo}>Pronta entrega</Text>

      {/* Empilha o Detalhe passando o parâmetro mandalaId */}
      <Pressable onPress={() => navigation.navigate('DetalheMandala', { mandalaId: 'pe-sol-e-lua' })}>
        <Text style={styles.link}>Abrir "Sol e Lua" →</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, gap: spacing.md, padding: spacing.lg, backgroundColor: colors.fundo },
  link: { ...typography.rotulo, color: colors.primariaEscura },
});