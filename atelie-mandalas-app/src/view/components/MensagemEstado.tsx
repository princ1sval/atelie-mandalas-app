import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { BotaoPrimario } from './BotaoPrimario';
import { colors, spacing, typography } from '../styles/theme';
import { NomeIcone } from '../styles/icons';

export interface MensagemEstadoProps {
  tipo: 'carregando' | 'erro' | 'vazio';
  mensagem?: string;
  onTentarNovamente?: () => void; // só aparece o botão no tipo 'erro'
}

const ICONES: Record<'erro' | 'vazio', NomeIcone> = {
  erro: 'alert-circle',
  vazio: 'search',
};

// Mostra os estados de uma tela que busca dados: carregando, erro ou lista vazia.
export function MensagemEstado({ tipo, mensagem, onTentarNovamente }: MensagemEstadoProps) {
  return (
    <View style={styles.container}>
      {tipo === 'carregando' ? (
        <ActivityIndicator size="large" color={colors.primaria} />
      ) : (
        <Feather name={ICONES[tipo]} size={32} color={colors.salvia} />
      )}

      {mensagem ? <Text style={styles.texto}>{mensagem}</Text> : null}

      {tipo === 'erro' && onTentarNovamente ? (
        <BotaoPrimario titulo="Tentar de novo" variante="contorno" onPress={onTentarNovamente} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  texto: { ...typography.corpo, textAlign: 'center' },
});