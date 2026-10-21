import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DetalheMandalaScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../styles/theme';

// TELA PROVISÓRIA (Etapa 4) — o detalhe de verdade vem na Etapa 6.
export function DetalheMandalaScreen({ route, navigation }: DetalheMandalaScreenProps) {
  const { mandalaId } = route.params; // parâmetro tipado: o TypeScript sabe que é string

  return (
    <View style={styles.tela}>
      <Text style={typography.titulo}>Detalhe</Text>
      <Text style={typography.corpo}>mandalaId recebido: {mandalaId}</Text>

      {/* Sai do Stack e vai para a aba Encomendar, levando parâmetros */}
      <Pressable onPress={() => navigation.navigate('Encomendar', { tema: 'pet', inspiracaoId: mandalaId })}>
        <Text style={styles.link}>Testar "Quero uma assim" →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, gap: spacing.md, padding: spacing.lg, backgroundColor: colors.fundo },
  link: { ...typography.rotulo, color: colors.primariaEscura },
});