import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { MeusPedidosScreenProps } from '../../navigation/types';
import { useMeusPedidosViewModel, ItemPedido } from '../../viewmodel/useMeusPedidosViewModel';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { MensagemEstado } from '../components/MensagemEstado';
import { confirmar } from '../utils/confirmar';
import { colors, fonts, fontSizes, larguraMaxima, radius, spacing, typography } from '../styles/theme';

// Histórico de pedidos salvo no SQLite deste aparelho.
// O título e a seta de voltar vêm do cabeçalho do Stack.
export function MeusPedidosScreen({ navigation }: MeusPedidosScreenProps) {
  const vm = useMeusPedidosViewModel();

  // As confirmações ficam na tela, e não no ViewModel: é a tela que conversa com a pessoa.
  async function excluir(pedido: ItemPedido) {
    const confirmou = await confirmar(
      'Excluir pedido?',
      `O pedido ${pedido.protocolo} sai do histórico deste aparelho. Isso não pode ser desfeito.`,
      'Excluir',
    );
    if (confirmou) vm.excluirPedido(pedido.id);
  }

  async function apagarMeusDados() {
    const confirmou = await confirmar(
      'Apagar meus dados?',
      'Os pedidos e o rascunho do formulário serão apagados deste aparelho. Isso não pode ser desfeito.',
      'Apagar',
    );
    if (!confirmou) return;
    if (await vm.apagarMeusDados()) {
      // Volta ao formulário pedindo para esvaziá-lo, porque ele ainda guarda os dados na memória.
      navigation.popTo('Encomenda', { limparEm: Date.now() });
    }
  }

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
      renderItem={({ item }) => <CartaoPedido pedido={item} onExcluir={() => excluir(item)} />}
      ListHeaderComponent={
        <Text style={[typography.pequeno, styles.centralizado]}>
          Os pedidos ficam guardados só neste aparelho, do mais recente para o mais antigo.
        </Text>
      }
      ListEmptyComponent={<MensagemEstado tipo="vazio" mensagem="Você ainda não fez nenhum pedido neste aparelho." />}
      ListFooterComponent={
        <View style={styles.rodape}>
          <BotaoPrimario titulo="Apagar meus dados" variante="contorno" icone="trash-2" onPress={apagarMeusDados} />
          <Text style={[typography.pequeno, styles.centralizado]}>
            Apaga os pedidos e o rascunho do formulário guardados neste aparelho.
          </Text>
          {vm.aviso ? <Text style={styles.aviso}>{vm.aviso}</Text> : null}
        </View>
      }
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ---------- Cartão de um pedido: só é usado aqui, então fica no mesmo arquivo ----------
interface CartaoPedidoProps {
  pedido: ItemPedido;
  onExcluir: () => void;
}

function CartaoPedido({ pedido, onExcluir }: CartaoPedidoProps) {
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

      <View style={styles.linhaBaixo}>
        <Text style={[styles.estimativa, !pedido.temEstimativa && styles.semEstimativa]}>{pedido.estimativaTexto}</Text>
        <Pressable
          onPress={onExcluir}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Excluir o pedido ${pedido.protocolo}`}
          style={({ pressed }) => pressed && styles.pressionado}
        >
          <Feather name="trash-2" size={18} color={colors.erro} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { ...larguraMaxima, flexGrow: 1, gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  centralizado: { textAlign: 'center' },
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
  linhaBaixo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  estimativa: { ...typography.rotulo, flex: 1, color: colors.primariaEscura },
  semEstimativa: { fontFamily: fonts.corpo, color: colors.textoSuave },
  pressionado: { opacity: 0.6 },
  rodape: { gap: spacing.sm, marginTop: spacing.sm },
  aviso: { ...typography.pequeno, color: colors.erro, textAlign: 'center' },
});
