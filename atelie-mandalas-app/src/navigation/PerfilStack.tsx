import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PerfilStackParamList } from './types';
import { opcoesStack } from './opcoesStack';
import { useSessao } from '../viewmodel/useSessao';
import { PerfilScreen } from '../view/screens/PerfilScreen';
import { EntrarScreen } from '../view/screens/EntrarScreen';
import { CadastroScreen } from '../view/screens/CadastroScreen';
import { MensagemEstado } from '../view/components/MensagemEstado';
import { colors } from '../view/styles/theme';

const Stack = createNativeStackNavigator<PerfilStackParamList>();

// Stack da aba Perfil. Sem login, mostra Entrar e Criar conta; com login, o Perfil.
// As telas mudam conforme a sessão: quando a pessoa entra ou sai, o React Navigation troca sozinho.
export function PerfilStack() {
  const { usuario, verificando } = useSessao();

  // Logo que o app abre, o Firebase ainda está lendo a sessão salva: evita piscar a tela Entrar.
  if (verificando) {
    return (
      <View style={styles.tela}>
        <MensagemEstado tipo="carregando" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={opcoesStack}>
      {usuario ? (
        <Stack.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false, title: 'Perfil' }} />
      ) : (
        <>
          <Stack.Screen name="Entrar" component={EntrarScreen} options={{ headerShown: false, title: 'Entrar' }} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
});
