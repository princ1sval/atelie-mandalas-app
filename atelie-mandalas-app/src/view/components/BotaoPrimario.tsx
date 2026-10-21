import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, fonts, fontSizes, radius, spacing } from '../styles/theme';
import { NomeIcone } from '../styles/icons';

export type VarianteBotao = 'cheio' | 'contorno' | 'cheioClaro' | 'contornoClaro';

export interface BotaoPrimarioProps {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBotao; // padrão: 'cheio'. As "Claro" são para fundos escuros.
  icone?: NomeIcone;
  carregando?: boolean; // mostra um indicador e bloqueia novos toques
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>; // quem usa pode ajustar o layout (ex.: flex: 1)
}

// Cor do texto e do ícone em cada variante.
const COR_CONTEUDO: Record<VarianteBotao, string> = {
  cheio: colors.textoSobrePrimaria,
  contorno: colors.primariaEscura,
  cheioClaro: colors.primariaEscura,
  contornoClaro: colors.textoSobrePrimaria,
};

export function BotaoPrimario({
  titulo,
  onPress,
  variante = 'cheio',
  icone,
  carregando = false,
  desabilitado = false,
  style,
}: BotaoPrimarioProps) {
  const inativo = desabilitado || carregando;
  const corConteudo = COR_CONTEUDO[variante];

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      // O Pressable informa se está sendo pressionado: usamos isso para dar um retorno visual.
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        pressed && styles.pressionado,
        inativo && styles.inativo,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corConteudo} />
      ) : (
        <>
          {icone ? <Feather name={icone} size={18} color={corConteudo} /> : null}
          <Text style={[styles.texto, { color: corConteudo }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  cheio: { backgroundColor: colors.primaria },
  contorno: { borderWidth: 1.5, borderColor: colors.primaria },
  cheioClaro: { backgroundColor: colors.textoSobrePrimaria },
  contornoClaro: { borderWidth: 1.5, borderColor: colors.textoSobrePrimaria },
  pressionado: { opacity: 0.8 },
  inativo: { opacity: 0.5 },
  texto: { fontFamily: fonts.corpoForte, fontSize: fontSizes.corpo },
});