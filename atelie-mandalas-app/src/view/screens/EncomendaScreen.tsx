import { Image, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { EncomendaScreenProps } from '../../navigation/types';
import { useEncomendaViewModel } from '../../viewmodel/useEncomendaViewModel';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { CampoTexto } from '../components/CampoTexto';
import { Chip } from '../components/Chip';
import { TituloSecao } from '../components/TituloSecao';
import { colors, fonts, fontSizes, larguraMaxima, radius, spacing, typography } from '../styles/theme';

export function EncomendaScreen({ route, navigation }: EncomendaScreenProps) {
  // Parâmetros opcionais: chegam quando a pessoa vem do "Quero uma assim".
  const vm = useEncomendaViewModel(route.params?.tema, route.params?.inspiracaoId);

  // Limpar os parâmetros da rota permite receber a mesma inspiração de novo depois.
  function removerInspiracao() {
    vm.removerInspiracao();
    navigation.setParams({ inspiracaoId: undefined });
  }

  function fazerOutroPedido() {
    vm.novoPedido();
    navigation.setParams({ tema: undefined, inspiracaoId: undefined });
  }

  function enviar() {
    Keyboard.dismiss(); // fecha o teclado antes de enviar
    vm.enviar();
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        automaticallyAdjustKeyboardInsets // iOS: rola até o campo focado
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TituloSecao
          nivel="tela"
          sobretitulo="pedido personalizado"
          titulo="Encomende a sua"
          descricao="Conte sua ideia e a Malu transforma em pontos."
        />

        {vm.inspiracao ? (
          <View style={styles.inspiracao}>
            <View style={styles.miniatura}>
              <Image
                source={vm.inspiracao.imagem}
                style={styles.imagemMiniatura}
                accessibilityLabel={vm.inspiracao.descricaoImagem}
              />
            </View>
            <View style={styles.textoInspiracao}>
              <Text style={typography.pequeno}>Inspirada em</Text>
              <Text style={typography.rotulo}>{vm.inspiracaoTexto}</Text>
            </View>
            <Pressable
              onPress={removerInspiracao}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Remover inspiração"
            >
              <Feather name="x" size={20} color={colors.textoSuave} />
            </Pressable>
          </View>
        ) : null}

        <CampoTexto
          rotulo="Seu nome"
          placeholder="Como podemos te chamar?"
          value={vm.pedido.nome}
          onChangeText={(texto) => vm.atualizarCampo('nome', texto)}
          erro={vm.erros.nome}
          autoCapitalize="words"
        />

        <CampoTexto
          rotulo="WhatsApp"
          placeholder="(00) 00000-0000"
          value={vm.pedido.whatsapp}
          onChangeText={vm.alterarWhatsapp}
          erro={vm.erros.whatsapp}
          keyboardType="phone-pad"
        />

        <View style={styles.grupo}>
          <Text style={typography.rotulo}>Tema</Text>
          <View style={styles.linhaChips}>
            {vm.opcoesTema.map((opcao) => (
              <Chip
                key={opcao.valor}
                rotulo={opcao.rotulo}
                selecionado={vm.pedido.tema === opcao.valor}
                onPress={() => vm.atualizarCampo('tema', opcao.valor)}
              />
            ))}
          </View>
          {vm.erros.tema ? <Text style={styles.erro}>{vm.erros.tema}</Text> : null}
        </View>

        <View style={styles.grupo}>
          <Text style={typography.rotulo}>Tamanho (diâmetro)</Text>
          <View style={styles.linhaChips}>
            {vm.tamanhos.map((tamanho) => (
              <Chip
                key={tamanho}
                rotulo={`${tamanho} cm`}
                selecionado={vm.pedido.tamanhoCm === tamanho}
                onPress={() => vm.atualizarCampo('tamanhoCm', tamanho)}
              />
            ))}
          </View>
        </View>

        <CampoTexto
          rotulo="Cores preferidas"
          placeholder="Ex.: tons de laranja e branco"
          value={vm.pedido.cores}
          onChangeText={(texto) => vm.atualizarCampo('cores', texto)}
        />

        <CampoTexto
          rotulo="Conte sua ideia"
          placeholder="Para quem é, o que a peça deve representar, referências…"
          value={vm.pedido.ideia}
          onChangeText={(texto) => vm.atualizarCampo('ideia', texto)}
          erro={vm.erros.ideia}
          multiline
          maxLength={vm.limiteIdeia}
          mostrarContador
        />

        <View style={styles.linhaPresente}>
          <View style={styles.textoPresente}>
            <Text style={typography.rotulo}>É para presente?</Text>
            <Text style={typography.pequeno}>Embalagem especial com cartão</Text>
          </View>
          <Switch
            value={vm.pedido.presente}
            onValueChange={(valor) => vm.atualizarCampo('presente', valor)}
            trackColor={{ false: colors.borda, true: colors.primaria }}
            thumbColor={colors.superficie}
            ios_backgroundColor={colors.borda}
            accessibilityLabel="É para presente?"
          />
        </View>

        {/* A estimativa muda na hora, conforme tamanho e presente */}
        <View style={styles.estimativa}>
          <Text style={styles.sobretituloEstimativa}>estimativa</Text>
          <Text style={styles.faixaPreco}>{vm.faixaPreco}</Text>
          <Text style={styles.prazo}>{vm.prazoTexto}</Text>
        </View>

        <View style={styles.envio}>
          <BotaoPrimario titulo="Enviar pedido" icone="send" onPress={enviar} carregando={vm.enviando} />
          {vm.mensagemFormulario ? (
            <Text style={[styles.erro, styles.centralizado]}>{vm.mensagemFormulario}</Text>
          ) : null}
          <Text style={[typography.pequeno, styles.centralizado]}>Você recebe a confirmação pelo WhatsApp</Text>
        </View>
      </ScrollView>

      {/* Confirmação: Modal transparente com fundo escuro por cima da tela */}
      <Modal visible={vm.protocolo !== null} transparent animationType="fade" onRequestClose={fazerOutroPedido}>
        <View style={styles.fundoModal}>
          <View style={styles.caixaModal}>
            <Feather name="check-circle" size={40} color={colors.primaria} />
            <Text style={typography.secao}>Pedido enviado!</Text>
            <Text style={[typography.corpo, styles.centralizado]}>
              Protocolo {vm.protocolo}. A Malu vai falar com você pelo WhatsApp para combinar os detalhes.
            </Text>
            <BotaoPrimario titulo="Fazer outro pedido" onPress={fazerOutroPedido} style={styles.botaoModal} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  conteudo: { ...larguraMaxima, gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  inspiracao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.lg,
  },
  miniatura: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.fundoImagem,
  },
  imagemMiniatura: { width: 48, height: 48 },
  textoInspiracao: { flex: 1, gap: spacing.xs },
  grupo: { gap: spacing.sm },
  linhaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  erro: { ...typography.pequeno, color: colors.erro },
  linhaPresente: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.lg,
  },
  textoPresente: { flex: 1, gap: spacing.xs },
  estimativa: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaria,
  },
  sobretituloEstimativa: { ...typography.sobretitulo, color: colors.amarelo },
  faixaPreco: { fontFamily: fonts.titulo, fontSize: fontSizes.secao, color: colors.textoSobrePrimaria },
  prazo: { ...typography.pequeno, color: colors.textoSobrePrimaria },
  envio: { gap: spacing.sm },
  centralizado: { textAlign: 'center' },
  fundoModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.sobreposicao,
  },
  caixaModal: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.superficie,
  },
  botaoModal: { alignSelf: 'stretch' },
});