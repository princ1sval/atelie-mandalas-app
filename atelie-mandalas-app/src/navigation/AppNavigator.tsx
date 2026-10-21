import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NomeIcone } from '../view/styles/icons';
import { RootTabParamList } from './types';
import { ProntaEntregaStack } from './ProntaEntregaStack';
import { PortfolioStack } from './PortfolioStack';
import { InicioScreen } from '../view/screens/InicioScreen';
import { EncomendaScreen } from '../view/screens/EncomendaScreen';
import { FaqScreen } from '../view/screens/FaqScreen';
import { colors, fonts } from '../view/styles/theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONES: Record<keyof RootTabParamList, NomeIcone> = {
  Inicio: 'home',
  ProntaEntregaTab: 'shopping-bag',
  PortfolioTab: 'grid',
  Encomendar: 'edit-3',
  Duvidas: 'help-circle',
};

// Navegador RAIZ: abas embaixo. Duas delas têm um Stack dentro.
export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // cada tela desenha o próprio título
        tabBarActiveTintColor: colors.primariaEscura,
        tabBarInactiveTintColor: colors.abaInativa,
        tabBarStyle: { backgroundColor: colors.superficie, borderTopColor: colors.borda },
        tabBarLabelStyle: { fontFamily: fonts.corpoMedio, fontSize: 11 },
        tabBarIcon: ({ color, size }) => <Feather name={ICONES[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="ProntaEntregaTab" component={ProntaEntregaStack} options={{ title: 'Pronta entrega' }} />
      <Tab.Screen name="PortfolioTab" component={PortfolioStack} options={{ title: 'Portfólio' }} />
      <Tab.Screen name="Encomendar" component={EncomendaScreen} options={{ title: 'Encomendar' }} />
      <Tab.Screen name="Duvidas" component={FaqScreen} options={{ title: 'Dúvidas' }} />
    </Tab.Navigator>
  );
}