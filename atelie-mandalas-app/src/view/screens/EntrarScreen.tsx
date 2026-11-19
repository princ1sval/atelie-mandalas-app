import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EntrarScreenProps } from '../../navigation/types';
import { useAuthViewModel } from '../../viewmodel/useAuthViewModel';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { CampoTexto } from '../components/CampoTexto';
import { TituloSecao } from '../components/TituloSecao';
import { colors, fonts, fontSizes, larguraMaxima, spacing, typography } from '../styles/theme';

// Entrar na conta. Ao dar certo, a aba Perfil troca para o perfil sozinha (ver PerfilStack).
export function EntrarScreen({ navigation }: EntrarScreenProps) {
  const vm = useAuthViewModel('entrar');

  function entrar() {
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
          sobretitulo="sua conta"
          titulo="Entrar"
          descricao="Com a conta, você envia encomendas e guarda o seu perfil. O catálogo continua aberto para todos."
        />

        <CampoTexto
          rotulo="E-mail"
          placeholder="seuemail@exemplo.com"
          value={vm.email}
          onChangeText={vm.alterarEmail}
          erro={vm.erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />

        <CampoTexto
          rotulo="Senha"
          placeholder="Sua senha"
          value={vm.senha}
          onChangeText={vm.alterarSenha}
          erro={vm.erros.senha}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
        />

        <View style={styles.envio}>
          <BotaoPrimario titulo="Entrar" icone="log-in" onPress={entrar} carregando={vm.enviando} />
          {vm.erro ? <Text style={[styles.erro, styles.centralizado]}>{vm.erro}</Text> : null}
        </View>

        <Pressable
          onPress={() => navigation.navigate('Cadastro')}
          hitSlop={8}
          accessibilityRole="link"
          style={({ pressed }) => [styles.linhaLink, pressed && styles.pressionado]}
        >
          <Text style={typography.pequeno}>Ainda não tem conta?</Text>
          <Text style={styles.link}>Criar conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  conteudo: { ...larguraMaxima, gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  envio: { gap: spacing.sm },
  erro: { ...typography.pequeno, color: colors.erro },
  centralizado: { textAlign: 'center' },
  linhaLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  link: { fontFamily: fonts.corpoForte, fontSize: fontSizes.pequeno, color: colors.primariaEscura },
  pressionado: { opacity: 0.7 },
});
