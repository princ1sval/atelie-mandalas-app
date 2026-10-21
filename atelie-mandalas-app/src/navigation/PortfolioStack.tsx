import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PortfolioStackParamList } from './types';
import { opcoesStack } from './opcoesStack';
import { PortfolioScreen } from '../view/screens/PortfolioScreen';
import { DetalheMandalaScreen } from '../view/screens/DetalheMandalaScreen';

const Stack = createNativeStackNavigator<PortfolioStackParamList>();

export function PortfolioStack() {
  return (
    <Stack.Navigator screenOptions={opcoesStack}>
      <Stack.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ headerShown: false, title: 'Portfólio' }}
      />
      <Stack.Screen name="DetalheMandala" component={DetalheMandalaScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}