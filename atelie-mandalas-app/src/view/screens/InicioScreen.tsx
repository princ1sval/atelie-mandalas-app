import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InicioScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../styles/theme';

// TELA PROVISÓRIA (Etapa 4) — o conteúdo de verdade vem na Etapa 6.
export function InicioScreen({ navigation }: InicioScreenProps) {
  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <Text style={typography.titulo}>Início</Text>

      {/* Vai para OUTRA aba, abrindo a primeira tela do Stack dela */}
      <Pressable onPress={() => navigation.navigate('ProntaEntregaTab', { screen: 'ProntaEntrega' })}>
        <Text style={styles.link}>Ver pronta entrega →</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Encomendar')}>
        <Text style={styles.link}>Encomendar a sua →</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, gap: spacing.md, padding: spacing.lg, backgroundColor: colors.fundo },
  link: { ...typography.rotulo, color: colors.primariaEscura },
});