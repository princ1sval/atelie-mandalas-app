import { StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { ProntaEntregaStack } from './ProntaEntregaStack';
import { PortfolioStack } from './PortfolioStack';
import { EncomendaStack } from './EncomendaStack';
import { InicioScreen } from '../view/screens/InicioScreen';
import { FaqScreen } from '../view/screens/FaqScreen';
import { PerfilScreen } from '../view/screens/PerfilScreen';
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
  Perfil: 'user',
};

// Navegador RAIZ: abas embaixo. Três delas têm um Stack dentro.
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
      {/* Com seis abas, cada nome tem uns 52 px no iPhone menor. Os nomes longos ganham uma
          versão curta só na barra (tabBarLabel); o title completo continua valendo no resto. */}
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Tab.Screen
        name="ProntaEntregaTab"
        component={ProntaEntregaStack}
        options={{ title: 'Pronta entrega', tabBarLabel: 'Prontas' }}
      />
      <Tab.Screen name="PortfolioTab" component={PortfolioStack} options={{ title: 'Portfólio' }} />
      <Tab.Screen name="Encomendar" component={EncomendaStack} options={{ title: 'Encomendar', tabBarLabel: 'Pedidos' }} />
      <Tab.Screen name="Duvidas" component={FaqScreen} options={{ title: 'Dúvidas' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
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