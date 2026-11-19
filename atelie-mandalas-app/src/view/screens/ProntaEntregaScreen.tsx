import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { ProntaEntregaScreenProps } from '../../navigation/types';
import { useProntaEntregaViewModel } from '../../viewmodel/useProntaEntregaViewModel';
import { useChacoalhar } from '../hooks/useChacoalhar';
import { CampoTexto } from '../components/CampoTexto';
import { GradeMandalas } from '../components/GradeMandalas';
import { MensagemEstado } from '../components/MensagemEstado';
import { TituloSecao } from '../components/TituloSecao';
import { colors, fonts, fontSizes, radius, spacing, typography } from '../styles/theme';

// A tela só DESENHA: os dados e as ações vêm do ViewModel.
export function ProntaEntregaScreen({ navigation }: ProntaEntregaScreenProps) {
  const vm = useProntaEntregaViewModel();

  // Navegar é papel da View: o ViewModel não conhece a navegação.
  function abrirDetalhe(mandalaId: string) {
    navigation.navigate('DetalheMandala', { mandalaId });
  }

  // Chacoalhar o celular abre uma peça sorteada. O ViewModel sorteia; a tela só navega.
  function abrirSurpresa() {
    const id = vm.mandalaSurpresa();
    if (id) abrirDetalhe(id);
  }

  // O hook liga o acelerômetro só com esta tela visível e diz se o aparelho tem o sensor.
  const sensorDisponivel = useChacoalhar(abrirSurpresa);

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
        mensagemVazia="Nenhuma peça encontrada. Tente outro nome ou cor."
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

        {/* A dica só aparece quando há sensor e peças para sortear (no navegador, nunca). */}
        {sensorDisponivel && !vm.carregando && !vm.erro ? (
          <View style={styles.dica}>
            <Feather name="smartphone" size={16} color={colors.primariaEscura} />
            <Text style={styles.textoDica}>Chacoalhe o celular para uma surpresa</Text>
          </View>
        ) : null}

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
  dica: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.salviaClara,
  },
  textoDica: { fontFamily: fonts.corpoMedio, fontSize: fontSizes.pequeno, color: colors.primariaEscura },
});
