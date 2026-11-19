import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CadastroScreenProps } from '../../navigation/types';
import { useAuthViewModel } from '../../viewmodel/useAuthViewModel';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { CampoTexto } from '../components/CampoTexto';
import { colors, fonts, fontSizes, larguraMaxima, spacing, typography } from '../styles/theme';

// Criar conta. O título e a seta de voltar vêm do cabeçalho do Stack.
// Ao dar certo, a pessoa já fica logada e a aba Perfil troca para o perfil sozinha.
export function CadastroScreen({ navigation }: CadastroScreenProps) {
  const vm = useAuthViewModel('cadastro');

  function criarConta() {
    Keyboard.dismiss(); // fecha o teclado antes de enviar
    vm.enviar();
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      automaticallyAdjustKeyboardInsets // iOS: rola até o campo focado
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      <Text style={typography.corpo}>Só o e-mail e uma senha. O resto do perfil você preenche depois, se quiser.</Text>

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
        placeholder="Pelo menos 6 caracteres"
        value={vm.senha}
        onChangeText={vm.alterarSenha}
        erro={vm.erros.senha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <CampoTexto
        rotulo="Confirme a senha"
        placeholder="Digite a senha de novo"
        value={vm.confirmacao}
        onChangeText={vm.alterarConfirmacao}
        erro={vm.erros.confirmacao}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      {/* Aviso de privacidade (seções 7.2 e 7.3): o que vai para onde. */}
      <Text style={[typography.pequeno, styles.centralizado]}>
        A conta fica no Firebase, do Google, só com o e-mail. A senha vai direto para o Firebase e não fica guardada
        neste aparelho.
      </Text>

      <View style={styles.envio}>
        <BotaoPrimario titulo="Criar conta" icone="user-plus" onPress={criarConta} carregando={vm.enviando} />
        {vm.erro ? <Text style={[styles.erro, styles.centralizado]}>{vm.erro}</Text> : null}
      </View>

      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={8}
        accessibilityRole="link"
        style={({ pressed }) => [styles.linhaLink, pressed && styles.pressionado]}
      >
        <Text style={typography.pequeno}>Já tem conta?</Text>
        <Text style={styles.link}>Entrar</Text>
      </Pressable>
    </ScrollView>
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
