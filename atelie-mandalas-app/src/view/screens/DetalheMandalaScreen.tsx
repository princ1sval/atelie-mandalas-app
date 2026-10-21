import { useLayoutEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { DetalheMandalaScreenProps } from '../../navigation/types';
import { useDetalheMandalaViewModel } from '../../viewmodel/useDetalheMandalaViewModel';
import { AcaoDetalhe } from '../../services/MandalaService';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { MensagemEstado } from '../components/MensagemEstado';
import { TituloSecao } from '../components/TituloSecao';
import { colors, fonts, fontSizes, radius, spacing, typography } from '../styles/theme';
import { NomeIcone } from '../styles/icons';

// Ícone do botão principal conforme o tipo da ação (escolha visual: fica na View).
const ICONE_ACAO: Record<AcaoDetalhe['tipo'], NomeIcone> = {
  tenhoInteresse: 'message-circle',
  queroUmaAssim: 'edit-3',
};

export function DetalheMandalaScreen({ route, navigation }: DetalheMandalaScreenProps) {
  const { mandalaId } = route.params;

  // A tela entrega ao ViewModel "o que fazer" no Quero uma assim: navegar para a aba Encomendar.
  const vm = useDetalheMandalaViewModel(mandalaId, (tema, inspiracaoId) =>
    navigation.navigate('Encomendar', { tema, inspiracaoId }),
  );

  // Coloca o botão de compartilhar no cabeçalho depois que a mandala carregar.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: vm.mandala
        ? () => (
            <Pressable
              onPress={vm.compartilhar}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Compartilhar"
            >
              <Feather name="share-2" size={20} color={colors.primariaEscura} />
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, vm.mandala, vm.compartilhar]);

  if (vm.carregando) {
    return <MensagemEstado tipo="carregando" />;
  }
  if (vm.erro || !vm.mandala) {
    return <MensagemEstado tipo="erro" mensagem={vm.erro ?? undefined} onTentarNovamente={vm.recarregar} />;
  }

  const { mandala } = vm;

  return (
    <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
      <View style={styles.fundoImagem}>
        <Image
          source={mandala.imagem}
          style={styles.imagem}
          resizeMode="contain"
          accessibilityLabel={mandala.descricaoImagem}
        />
      </View>

      <View style={styles.cabecalho}>
        <Text style={typography.sobretitulo}>{vm.origemTexto}</Text>
        <Text style={typography.titulo} accessibilityRole="header">
          {mandala.nome}
        </Text>
        {vm.precoTexto ? (
          <Text style={styles.preco}>
            {vm.precoTexto}
            <Text style={typography.pequeno}> · peça disponível</Text>
          </Text>
        ) : (
          <Text style={typography.pequeno}>Peça feita sob encomenda — não está à venda</Text>
        )}
      </View>

      <View style={styles.informacoes}>
        {vm.informacoes.map((info) => (
          <View key={info.rotulo} style={styles.linhaInfo}>
            <Text style={typography.pequeno}>{info.rotulo}</Text>
            <Text style={styles.valorInfo}>{info.valor}</Text>
          </View>
        ))}
      </View>

      <TituloSecao sobretitulo={vm.rotuloSecao} titulo={mandala.subtitulo} />
      <Text style={typography.corpo}>{mandala.descricao}</Text>

      {vm.acao ? (
        <View style={styles.acao}>
          <BotaoPrimario titulo={vm.acao.rotulo} icone={ICONE_ACAO[vm.acao.tipo]} onPress={vm.executarAcao} />
          <Text style={[typography.pequeno, styles.centralizado]}>{vm.acao.ajuda}</Text>
          {vm.aviso ? <Text style={styles.aviso}>{vm.aviso}</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  fundoImagem: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.fundoImagem,
  },
  imagem: { width: '88%', height: '88%' },
  cabecalho: { gap: spacing.xs },
  preco: { fontFamily: fonts.corpoForte, fontSize: fontSizes.secao, color: colors.primariaEscura },
  informacoes: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.lg,
  },
  linhaInfo: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  valorInfo: { ...typography.rotulo, flexShrink: 1, textAlign: 'right' },
  acao: { gap: spacing.sm, marginTop: spacing.sm },
  centralizado: { textAlign: 'center' },
  aviso: { ...typography.pequeno, color: colors.erro, textAlign: 'center' },
});