import { StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { ProntaEntregaStack } from './ProntaEntregaStack';
import { PortfolioStack } from './PortfolioStack';
import { InicioScreen } from '../view/screens/InicioScreen';
import { EncomendaScreen } from '../view/screens/EncomendaScreen';
import { FaqScreen } from '../view/screens/FaqScreen';
import { colors, fonts, radius } from '../view/styles/theme';
import { NomeIcone } from '../view/styles/icons';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Ícone de cada aba (nomes do pacote Feather).
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
        tabBarLabelStyle: { fontFamily: fonts.corpoMedio, fontSize: 10 },
        tabBarIconStyle: styles.areaIcone, // espaço para a "pílula" caber
        // Aba ativa: ícone dentro de uma pílula verde-clara, como no canvas.
        tabBarIcon: ({ focused, color }) => (
          <View style={[styles.pilula, focused && styles.pilulaAtiva]}>
            <Feather name={ICONES[route.name]} size={20} color={color} />
          </View>
        ),
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

const styles = StyleSheet.create({
  areaIcone: { width: 52, height: 28 },
  pilula: {
    width: 52,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  pilulaAtiva: { backgroundColor: colors.salviaClara },
});