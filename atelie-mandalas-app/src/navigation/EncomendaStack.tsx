import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EncomendaStackParamList } from './types';
import { opcoesStack } from './opcoesStack';
import { EncomendaScreen } from '../view/screens/EncomendaScreen';
import { MeusPedidosScreen } from '../view/screens/MeusPedidosScreen';

const Stack = createNativeStackNavigator<EncomendaStackParamList>();

// Stack dentro da aba "Encomendar": o formulário e, por cima dele, o histórico.
export function EncomendaStack() {
  return (
    <Stack.Navigator screenOptions={opcoesStack}>
      <Stack.Screen
        name="Encomenda"
        component={EncomendaScreen}
        // o formulário desenha o próprio título; "title" vira o texto do botão voltar no iOS
        options={{ headerShown: false, title: 'Encomendar' }}
      />
      <Stack.Screen name="MeusPedidos" component={MeusPedidosScreen} options={{ title: 'Meus pedidos' }} />
    </Stack.Navigator>
  );
}
