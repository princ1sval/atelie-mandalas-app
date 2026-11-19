import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { usePerfilViewModel } from '../../viewmodel/usePerfilViewModel';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { CampoTexto } from '../components/CampoTexto';
import { FotoPerfil } from '../components/FotoPerfil';
import { MensagemEstado } from '../components/MensagemEstado';
import { TituloSecao } from '../components/TituloSecao';
import { colors, fonts, fontSizes, larguraMaxima, spacing, typography } from '../styles/theme';

// Perfil da cliente: nome, WhatsApp e foto, guardados só neste aparelho.
// A tela não conhece câmera, galeria nem arquivos: ela só chama o ViewModel.
export function PerfilScreen() {
  const vm = usePerfilViewModel();

  function salvar() {
    Keyboard.dismiss(); // fecha o teclado antes de salvar
    vm.salvar();
  }

  if (vm.carregando || vm.erro) {
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
          sobretitulo="seu perfil"
          titulo="Meu perfil"
          descricao="Com o perfil salvo, a encomenda já abre com o seu nome e o seu WhatsApp."
        />

        <View style={styles.areaFoto}>
          <FotoPerfil uri={vm.perfil.fotoUri} nome={vm.perfil.nome} tamanho={112} />

          {vm.fotoDisponivel ? (
            <>
              <View style={styles.botoesFoto}>
                <BotaoPrimario titulo="Tirar foto" variante="contorno" icone="camera" onPress={vm.tirarFoto} />
                <BotaoPrimario
                  titulo="Escolher da galeria"
                  variante="contorno"
                  icone="image"
                  onPress={vm.escolherDaGaleria}
                />
              </View>

              {vm.perfil.fotoUri ? (
                <Pressable
                  onPress={vm.removerFoto}
                  hitSlop={8}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.link, pressed && styles.pressionado]}
                >
                  <Feather name="trash-2" size={16} color={colors.primariaEscura} />
                  <Text style={styles.textoLink}>Remover foto</Text>
                </Pressable>
              ) : null}

              {vm.avisoFoto ? <Text style={[styles.erro, styles.centralizado]}>{vm.avisoFoto}</Text> : null}
            </>
          ) : (
            // No navegador não há onde guardar o arquivo da foto (ver o ImagemService).
            <Text style={[typography.pequeno, styles.centralizado]}>A foto do perfil funciona no app do celular.</Text>
          )}
        </View>

        <CampoTexto
          rotulo="Seu nome"
          placeholder="Como podemos te chamar?"
          value={vm.perfil.nome}
          onChangeText={vm.alterarNome}
          erro={vm.erros.nome}
          autoCapitalize="words"
        />

        <CampoTexto
          rotulo="WhatsApp (opcional)"
          placeholder="(00) 00000-0000"
          value={vm.perfil.whatsapp}
          onChangeText={vm.alterarWhatsapp}
          erro={vm.erros.whatsapp}
          keyboardType="phone-pad"
        />

        <View style={styles.grupo}>
          <CampoTexto
            rotulo="Cidade (opcional)"
            placeholder="Ex.: Muriaé – MG"
            value={vm.perfil.cidade ?? ''}
            onChangeText={vm.alterarCidade}
            autoCapitalize="words"
          />
          {/* No navegador o botão some: lá a cliente digita a cidade. */}
          {vm.localizacaoDisponivel ? (
            <BotaoPrimario
              titulo="Usar minha localização"
              variante="contorno"
              icone="map-pin"
              onPress={vm.usarMinhaLocalizacao}
              carregando={vm.buscandoCidade}
            />
          ) : null}
          {vm.distanciaTexto ? <Text style={styles.distancia}>{vm.distanciaTexto}</Text> : null}
          {vm.avisoCidade ? <Text style={styles.erro}>{vm.avisoCidade}</Text> : null}
        </View>

        <View style={styles.envio}>
          <BotaoPrimario titulo="Salvar" icone="check" onPress={salvar} carregando={vm.salvando} />
          {vm.erroSalvar ? <Text style={[styles.erro, styles.centralizado]}>{vm.erroSalvar}</Text> : null}
          {vm.salvoAgora ? <Text style={[styles.sucesso, styles.centralizado]}>Perfil salvo neste aparelho.</Text> : null}
          <Text style={[typography.pequeno, styles.centralizado]}>
            O perfil fica só neste aparelho. Para apagá-lo, use "Apagar meus dados" em Pedidos › Meus pedidos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  conteudo: { ...larguraMaxima, gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  areaFoto: { alignItems: 'center', gap: spacing.md },
  botoesFoto: { alignSelf: 'stretch', gap: spacing.sm },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textoLink: { fontFamily: fonts.corpoForte, fontSize: fontSizes.pequeno, color: colors.primariaEscura },
  pressionado: { opacity: 0.7 },
  grupo: { gap: spacing.sm },
  distancia: { fontFamily: fonts.corpoForte, fontSize: fontSizes.pequeno, color: colors.primariaEscura },
  envio: { gap: spacing.sm },
  erro: { ...typography.pequeno, color: colors.erro },
  sucesso: { ...typography.pequeno, fontFamily: fonts.corpoForte, color: colors.primariaEscura },
  centralizado: { textAlign: 'center' },
});
