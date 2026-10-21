import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { InicioScreenProps } from '../../navigation/types';
import { useInicioViewModel } from '../../viewmodel/useInicioViewModel';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { MensagemEstado } from '../components/MensagemEstado';
import { TituloSecao } from '../components/TituloSecao';
import { colors, fonts, fontSizes, larguraMaxima, radius, spacing, typography } from '../styles/theme';
import { NomeIcone } from '../styles/icons';

// Imagens da identidade visual (decoração da tela, não são dados do app).
const IMAGEM_DECORATIVA = require('../../../assets/mandalas/mandala-decorativa.png');
const IMAGEM_TECNICA = require('../../../assets/mandalas/sol-e-lua.png');

// Ícone de cada símbolo da seção "O que é uma mandala?".
const ICONE_SIMBOLO: Record<string, NomeIcone> = {
  centro: 'target',
  circulo: 'circle',
  ponto: 'more-horizontal',
};

export function InicioScreen({ navigation }: InicioScreenProps) {
  const vm = useInicioViewModel();

  if (vm.carregando || vm.erro || !vm.atelie) {
    return (
      <SafeAreaView style={styles.tela}>
        {vm.carregando ? (
          <MensagemEstado tipo="carregando" />
        ) : (
          <MensagemEstado tipo="erro" mensagem={vm.erro ?? undefined} onTentarNovamente={vm.recarregar} />
        )}
      </SafeAreaView>
    );
  }

  const { atelie } = vm;

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* ---------- TOPO (cartão verde de boas-vindas) ---------- */}
        <View style={styles.hero}>
          <Image
            source={IMAGEM_DECORATIVA}
            style={styles.mandalaDecorativa}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text style={styles.linhaBoasVindas}>seja bem-vindo ao</Text>
          <Text style={styles.linhaAtelie}>ATELIÊ</Text>

          <View style={styles.logo} accessible accessibilityRole="header" accessibilityLabel={atelie.nome}>
            <Text style={styles.logoLetra}>M</Text>
            <View>
              <Text style={styles.logoResto}>alu</Text>
              <Text style={styles.logoResto}>andalas</Text>
            </View>
          </View>

          <Text style={styles.slogan}>{atelie.slogan}</Text>
          <Text style={styles.prazer}>{atelie.boasVindas}</Text>

          <View style={styles.botoesHero}>
            <BotaoPrimario
              titulo="Ver pronta entrega"
              variante="cheioClaro"
              onPress={() => navigation.navigate('ProntaEntregaTab', { screen: 'ProntaEntrega' })}
            />
            <BotaoPrimario
              titulo="Encomendar a sua"
              variante="contornoClaro"
              onPress={() => navigation.navigate('Encomendar')}
            />
          </View>
        </View>

        {/* ---------- NOSSA HISTÓRIA ---------- */}
        <View style={styles.secao}>
          <TituloSecao sobretitulo="nossa história" titulo={atelie.historia.titulo} />
          <Text style={typography.corpo}>{atelie.historia.texto}</Text>

          <View style={styles.citacao}>
            <Feather name="star" size={22} color={colors.amarelo} style={styles.estrela} />
            <Text style={styles.textoCitacao}>{atelie.historia.citacao}</Text>
            <Text style={styles.complementoCitacao}>{atelie.historia.complementoCitacao}</Text>
          </View>
        </View>

        {/* ---------- SIGNIFICADO ---------- */}
        <View style={styles.secao}>
          <TituloSecao sobretitulo="significado" titulo={atelie.significado.titulo} />
          <Text style={typography.corpo}>{atelie.significado.texto}</Text>

          <View style={styles.simbolos}>
            {atelie.significado.simbolos.map((simbolo) => (
              <View key={simbolo.id} style={styles.simbolo}>
                <Feather name={ICONE_SIMBOLO[simbolo.id] ?? 'circle'} size={24} color={colors.marrom} />
                <Text style={styles.nomeSimbolo}>{simbolo.nome}</Text>
                <Text style={typography.pequeno}>{simbolo.descricao}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ---------- A TÉCNICA ---------- */}
        <View style={[styles.secao, styles.tecnica]}>
          <View style={styles.fundoImagemTecnica}>
            <Image
              source={IMAGEM_TECNICA}
              style={styles.imagemTecnica}
              accessibilityLabel="Mandala Sol e Lua em pontilhismo"
            />
          </View>
          <View style={styles.textoTecnica}>
            <Text style={typography.sobretitulo}>a técnica</Text>
            <Text style={styles.tituloTecnica}>{atelie.tecnica.titulo}</Text>
            <Text style={typography.pequeno}>{atelie.tecnica.texto}</Text>
            <Pressable
              onPress={() => navigation.navigate('PortfolioTab', { screen: 'Portfolio' })}
              accessibilityRole="link"
              hitSlop={8}
            >
              <Text style={styles.link}>Ver o portfólio →</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  conteudo: { ...larguraMaxima, gap: spacing.xxl, paddingTop: spacing.sm, paddingBottom: spacing.xxl },

  // Topo
  hero: {
    overflow: 'hidden', // corta a mandala decorativa que passa da borda
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaria,
  },
  mandalaDecorativa: {
    position: 'absolute',
    right: -150,
    top: 90,
    width: 370,
    height: 370,
    opacity: 0.38,
  },
  linhaBoasVindas: {
    fontFamily: fonts.tituloLeve,
    fontSize: 24,
    color: colors.textoSobrePrimaria,
  },
  linhaAtelie: {
    fontFamily: fonts.titulo,
    fontSize: 26,
    letterSpacing: 2,
    color: colors.textoSobrePrimaria,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  // Tamanhos exclusivos do logotipo
  logoLetra: { fontFamily: fonts.tituloLeve, fontSize: 112, lineHeight: 124, color: colors.textoSobrePrimaria },
  logoResto: { fontFamily: fonts.tituloLeve, fontSize: 42, lineHeight: 46, color: colors.textoSobrePrimaria },
  slogan: {
    maxWidth: 280,
    fontFamily: fonts.corpoLeve,
    fontSize: fontSizes.corpo,
    lineHeight: 23,
    color: colors.textoSobrePrimaria,
  },
  prazer: { fontFamily: fonts.titulo, fontSize: fontSizes.secao, color: colors.amarelo },
  botoesHero: { gap: spacing.sm, marginTop: spacing.md },

  // Seções
  secao: { gap: spacing.md, paddingHorizontal: spacing.lg },
  citacao: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.marrom,
  },
  estrela: { position: 'absolute', top: spacing.lg, right: spacing.lg },
  textoCitacao: {
    maxWidth: 260,
    fontFamily: fonts.titulo,
    fontSize: 26,
    lineHeight: 31,
    color: colors.textoSobrePrimaria,
  },
  complementoCitacao: { ...typography.pequeno, color: colors.amarelo },
  simbolos: { flexDirection: 'row', gap: spacing.sm },
  simbolo: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.lg,
  },
  nomeSimbolo: { fontFamily: fonts.titulo, fontSize: fontSizes.destaque, color: colors.texto },

  // Técnica
  tecnica: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.xl,
  },
  fundoImagemTecnica: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.fundoImagem,
  },
  imagemTecnica: { width: 90, height: 90 },
  textoTecnica: { flex: 1, gap: spacing.xs },
  tituloTecnica: { fontFamily: fonts.titulo, fontSize: fontSizes.secao, color: colors.texto },
  link: {
    marginTop: spacing.xs,
    fontFamily: fonts.corpoForte,
    fontSize: fontSizes.pequeno,
    color: colors.primariaEscura,
  },
});