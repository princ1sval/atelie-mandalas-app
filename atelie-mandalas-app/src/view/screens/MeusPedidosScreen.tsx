import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useMeusPedidosViewModel, ItemPedido } from '../../viewmodel/useMeusPedidosViewModel';
import { MensagemEstado } from '../components/MensagemEstado';
import { colors, fonts, fontSizes, larguraMaxima, radius, spacing, typography } from '../styles/theme';

// Histórico de pedidos salvo no SQLite deste aparelho.
// O título e a seta de voltar vêm do cabeçalho do Stack.
export function MeusPedidosScreen() {
  const vm = useMeusPedidosViewModel();

  if (vm.carregando) {
    return <MensagemEstado tipo="carregando" />;
  }
  if (vm.erro) {
    return <MensagemEstado tipo="erro" mensagem={vm.erro} onTentarNovamente={vm.recarregar} />;
  }

  return (
    <FlatList
      data={vm.pedidos}
      keyExtractor={(pedido) => String(pedido.id)}
      renderItem={({ item }) => <CartaoPedido pedido={item} />}
      ListHeaderComponent={
        <Text style={[typography.pequeno, styles.aviso]}>
          Os pedidos ficam guardados só neste aparelho, do mais recente para o mais antigo.
        </Text>
      }
      ListEmptyComponent={<MensagemEstado tipo="vazio" mensagem="Você ainda não fez nenhum pedido neste aparelho." />}
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ---------- Cartão de um pedido: só é usado aqui, então fica no mesmo arquivo ----------
function CartaoPedido({ pedido }: { pedido: ItemPedido }) {
  return (
    <View style={styles.cartao}>
      <View style={styles.linhaTopo}>
        <Text style={styles.protocolo}>{pedido.protocolo}</Text>
        <Text style={typography.pequeno}>{pedido.dataTexto}</Text>
      </View>

      <Text style={typography.rotulo}>{pedido.resumo}</Text>
      {pedido.cores ? <Text style={typography.pequeno}>Cores: {pedido.cores}</Text> : null}
      <Text style={typography.corpo} numberOfLines={3}>
        {pedido.ideia}
      </Text>

      <Text style={[styles.estimativa, !pedido.temEstimativa && styles.semEstimativa]}>{pedido.estimativaTexto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { ...larguraMaxima, flexGrow: 1, gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  aviso: { textAlign: 'center' },
  cartao: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.md,
  },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  protocolo: { fontFamily: fonts.corpoForte, fontSize: fontSizes.corpo, color: colors.primariaEscura },
  estimativa: { ...typography.rotulo, marginTop: spacing.xs, color: colors.primariaEscura },
  semEstimativa: { fontFamily: fonts.corpo, color: colors.textoSuave },
});
