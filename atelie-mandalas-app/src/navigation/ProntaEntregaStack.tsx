import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProntaEntregaStackParamList } from './types';
import { opcoesStack } from './opcoesStack';
import { ProntaEntregaScreen } from '../view/screens/ProntaEntregaScreen';
import { DetalheMandalaScreen } from '../view/screens/DetalheMandalaScreen';

const Stack = createNativeStackNavigator<ProntaEntregaStackParamList>();

export function ProntaEntregaStack() {
  return (
    <Stack.Navigator screenOptions={opcoesStack}>
      <Stack.Screen
        name="ProntaEntrega"
        component={ProntaEntregaScreen}
        // a lista desenha o próprio título; "title" vira o texto do botão voltar no iOS
        options={{ headerShown: false, title: 'Pronta entrega' }}
      />
      <Stack.Screen name="DetalheMandala" component={DetalheMandalaScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}