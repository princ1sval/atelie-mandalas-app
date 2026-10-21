import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Mandala, NOMES_TEMA } from '../../model/Mandala';
import { formatarMoeda } from '../../utils/formatters';
import { colors, fonts, fontSizes, radius, shadow, spacing, typography } from '../styles/theme';

export interface MandalaCardProps {
  mandala: Mandala;
  onPress: () => void;
  style?: StyleProp<ViewStyle>; // a tela decide a largura (ex.: colunas da FlatList)
}

// Card usado na Pronta Entrega (mostra preço) e no Portfólio (mostra o tema).
export function MandalaCard({ mandala, onPress, style }: MandalaCardProps) {
  const ehProntaEntrega = mandala.origem === 'prontaEntrega';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${mandala.nome}. Ver detalhes`}
      style={({ pressed }) => [styles.card, pressed && styles.pressionado, style]}
    >
      <View style={styles.fundoImagem}>
        <Image
          source={mandala.imagem}
          style={styles.imagem}
          resizeMode="contain"
          accessibilityLabel={mandala.descricaoImagem}
        />
      </View>

      <View style={styles.textos}>
        <Text style={styles.nome} numberOfLines={1}>
          {mandala.nome}
        </Text>

        {ehProntaEntrega ? (
          <>
            <Text style={typography.pequeno}>
              {mandala.tamanhoCm} cm · {mandala.base}
            </Text>
            {mandala.preco !== undefined ? (
              <Text style={styles.preco}>{formatarMoeda(mandala.preco)}</Text>
            ) : null}
          </>
        ) : (
          <View style={styles.linhaTema}>
            {mandala.tema ? <Text style={styles.etiqueta}>{NOMES_TEMA[mandala.tema]}</Text> : null}
            <Text style={typography.pequeno}>{mandala.tamanhoCm} cm</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.lg,
    ...shadow,
  },
  pressionado: { opacity: 0.85 },
  fundoImagem: {
    aspectRatio: 1, // sempre quadrado, seja qual for a largura do card
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.fundoImagem,
  },
  imagem: { width: '86%', height: '86%' },
  textos: { gap: spacing.xs, paddingHorizontal: spacing.xs, paddingBottom: spacing.xs },
  nome: { fontFamily: fonts.titulo, fontSize: fontSizes.destaque, color: colors.texto },
  preco: { fontFamily: fonts.corpoForte, fontSize: fontSizes.corpo, color: colors.primariaEscura },
  linhaTema: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  etiqueta: {
    overflow: 'hidden', // necessário no iOS para o fundo respeitar o arredondado
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.salviaClara,
    fontFamily: fonts.corpoMedio,
    fontSize: fontSizes.legenda,
    color: colors.primariaEscura,
  },
});