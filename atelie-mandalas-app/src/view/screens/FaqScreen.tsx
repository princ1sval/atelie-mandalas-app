import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { PerguntaFaq } from '../../model/Faq';
import { useFaqViewModel } from '../../viewmodel/useFaqViewModel';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { CampoTexto } from '../components/CampoTexto';
import { MensagemEstado } from '../components/MensagemEstado';
import { TituloSecao } from '../components/TituloSecao';
import { colors, fonts, fontSizes, larguraMaxima, radius, spacing, typography } from '../styles/theme';

export function FaqScreen() {
  const vm = useFaqViewModel();

  function renderizarConteudo() {
    if (vm.carregando) {
      return <MensagemEstado tipo="carregando" />;
    }
    if (vm.erro) {
      return <MensagemEstado tipo="erro" mensagem={vm.erro} onTentarNovamente={vm.recarregar} />;
    }
    return (
      <SectionList
        sections={vm.secoes}
        keyExtractor={(pergunta) => pergunta.id}
        // A lista só redesenha os itens se "data" ou "extraData" mudarem:
        // sem isto, tocar numa pergunta não abriria a resposta.
        extraData={vm.perguntaAbertaId}
        renderSectionHeader={({ section }) => (
          <View style={styles.cabecalhoSecao}>
            <TituloSecao titulo={section.title} />
          </View>
        )}
        renderItem={({ item }) => (
          <ItemPergunta
            pergunta={item}
            aberta={vm.perguntaAbertaId === item.id}
            onPress={() => vm.alternarPergunta(item.id)}
          />
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<MensagemEstado tipo="vazio" mensagem="Nenhuma dúvida encontrada para essa busca." />}
        ListFooterComponent={
          <View style={styles.cartaoWhatsApp}>
            <Feather name="message-circle" size={28} color={colors.amarelo} />
            <Text style={styles.tituloCartao}>Não achou sua resposta?</Text>
            <Text style={styles.textoCartao}>Fale direto com o ateliê.</Text>
            <BotaoPrimario
              titulo="Chamar no WhatsApp"
              variante="cheioClaro"
              onPress={vm.chamarNoWhatsApp}
              style={styles.botaoCartao}
            />
            {vm.aviso ? <Text style={styles.textoCartao}>{vm.aviso}</Text> : null}
          </View>
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.cabecalho}>
        <TituloSecao nivel="tela" sobretitulo="tire suas dúvidas" titulo="Dúvidas frequentes" />
        <CampoTexto
          formato="arredondado"
          icone="search"
          placeholder="Buscar dúvida"
          value={vm.busca}
          onChangeText={vm.alterarBusca}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {renderizarConteudo()}
    </SafeAreaView>
  );
}

// ---------- Item da lista: só é usado aqui, então fica no mesmo arquivo ----------
interface ItemPerguntaProps {
  pergunta: PerguntaFaq;
  aberta: boolean;
  onPress: () => void;
}

function ItemPergunta({ pergunta, aberta, onPress }: ItemPerguntaProps) {
  return (
    <View style={[styles.item, aberta && styles.itemAberto]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberta }}
        style={({ pressed }) => [styles.linhaPergunta, pressed && styles.pressionado]}
      >
        <Text style={styles.textoPergunta}>{pergunta.pergunta}</Text>
        <Feather name={aberta ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primariaEscura} />
      </Pressable>
      {aberta ? <Text style={styles.resposta}>{pergunta.resposta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  cabecalho: {
    ...larguraMaxima,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  lista: { ...larguraMaxima, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  cabecalhoSecao: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  item: {
    marginBottom: spacing.sm,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.md,
  },
  itemAberto: { borderColor: colors.salvia },
  linhaPergunta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressionado: { opacity: 0.7 },
  textoPergunta: {
    flex: 1,
    fontFamily: fonts.corpoMedio,
    fontSize: fontSizes.corpo,
    color: colors.texto,
  },
  resposta: { ...typography.corpo, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  cartaoWhatsApp: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.marrom,
  },
  tituloCartao: { fontFamily: fonts.titulo, fontSize: fontSizes.secao, color: colors.textoSobrePrimaria },
  textoCartao: { ...typography.pequeno, color: colors.textoSobrePrimaria, textAlign: 'center' },
  botaoCartao: { alignSelf: 'stretch', marginTop: spacing.sm },
});