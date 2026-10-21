import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortfolioScreenProps } from '../../navigation/types';
import { usePortfolioViewModel } from '../../viewmodel/usePortfolioViewModel';
import { Chip } from '../components/Chip';
import { GradeMandalas } from '../components/GradeMandalas';
import { MensagemEstado } from '../components/MensagemEstado';
import { TituloSecao } from '../components/TituloSecao';
import { colors, spacing, typography } from '../styles/theme';

export function PortfolioScreen({ navigation }: PortfolioScreenProps) {
  const vm = usePortfolioViewModel();

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
      <GradeMandalas
        mandalas={vm.mandalas}
        onAbrirMandala={abrirDetalhe}
        mensagemVazia="Ainda não há encomendas com esse tema."
      />
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.cabecalho}>
        <TituloSecao
          nivel="tela"
          sobretitulo="encomendas entregues"
          titulo="Portfólio"
          descricao="Cada mandala conta a história de quem encomendou."
        />
      </View>

      {/* Filtro por tema: chips numa linha que rola para o lado */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipsConteudo}
      >
        {vm.opcoesFiltro.map((opcao) => (
          <Chip
            key={opcao.valor}
            rotulo={opcao.rotulo}
            selecionado={vm.filtro === opcao.valor}
            onPress={() => vm.selecionarFiltro(opcao.valor)}
          />
        ))}
      </ScrollView>

      {!vm.carregando && !vm.erro ? <Text style={[typography.pequeno, styles.resumo]}>{vm.resumo}</Text> : null}

      {renderizarConteudo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  cabecalho: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
    // Sem isto a ScrollView horizontal estica (flexGrow) ou é espremida pela lista (flexShrink).
  chips: { flexGrow: 0, flexShrink: 0 },
  chipsConteudo: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  resumo: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
});