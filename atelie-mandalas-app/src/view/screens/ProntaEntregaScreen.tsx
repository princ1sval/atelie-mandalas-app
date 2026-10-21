import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProntaEntregaScreenProps } from '../../navigation/types';
import { useProntaEntregaViewModel } from '../../viewmodel/useProntaEntregaViewModel';
import { useGrade } from '../hooks/useGrade';
import { CampoTexto } from '../components/CampoTexto';
import { MandalaCard } from '../components/MandalaCard';
import { MensagemEstado } from '../components/MensagemEstado';
import { TituloSecao } from '../components/TituloSecao';
import { colors, spacing, typography } from '../styles/theme';

// A tela só DESENHA: os dados e as ações vêm do ViewModel.
export function ProntaEntregaScreen({ navigation }: ProntaEntregaScreenProps) {
  const vm = useProntaEntregaViewModel();
  const { colunas, larguraCard } = useGrade();

  // Navegar é papel da View: o ViewModel não conhece a navegação.
  function abrirDetalhe(mandalaId: string) {
    navigation.navigate('DetalheMandala', { mandalaId });
  }

  function renderizarConteudo() {
    if (vm.carregando) {
      return <MensagemEstado tipo="carregando" />;
    }
    if (vm.erro) {
      return <MensagemEstado tipo="erro" mensagem={vm.erro} onTentarNovamente={vm.recarregar} />;
    }
    return (
      <FlatList
        key={`grade-${colunas}`} // numColumns não pode mudar "ao vivo": a key nova recria a lista
        data={vm.mandalas}
        keyExtractor={(mandala) => mandala.id}
        numColumns={colunas}
        renderItem={({ item }) => (
          <MandalaCard mandala={item} onPress={() => abrirDetalhe(item.id)} style={{ width: larguraCard }} />
        )}
        columnWrapperStyle={styles.linha}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <MensagemEstado tipo="vazio" mensagem="Nenhuma peça encontrada. Tente outro nome ou cor." />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      {/* Cabeçalho fixo: só os cards rolam */}
      <View style={styles.cabecalho}>
        <TituloSecao
          nivel="tela"
          sobretitulo="peças prontas"
          titulo="Pronta entrega"
          descricao="Estilos já definidos, prontos para ir para a sua casa."
        />
        <CampoTexto
          formato="arredondado"
          icone="search"
          placeholder="Buscar por nome ou cor"
          value={vm.busca}
          onChangeText={vm.alterarBusca}
          autoCorrect={false}
          returnKeyType="search"
        />
        {!vm.carregando && !vm.erro ? <Text style={typography.pequeno}>{vm.resumo}</Text> : null}
      </View>

      {renderizarConteudo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  cabecalho: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  lista: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  linha: { gap: spacing.md }, // espaço entre as colunas
});