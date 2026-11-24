import { StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { ProntaEntregaStack } from './ProntaEntregaStack';
import { PortfolioStack } from './PortfolioStack';
import { EncomendaStack } from './EncomendaStack';
import { InicioScreen } from '../view/screens/InicioScreen';
import { PerfilStack } from './PerfilStack';
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
  PerfilTab: 'user',
};

// Navegador RAIZ: abas embaixo. Quatro delas têm um Stack dentro.
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
      {/* tabBarButtonTestID: nome fixo de cada aba para os testes end-to-end (Maestro). */}
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início', tabBarButtonTestID: 'aba-inicio' }} />
      <Tab.Screen
        name="ProntaEntregaTab"
        component={ProntaEntregaStack}
        options={{ title: 'Pronta entrega', tabBarLabel: 'Prontas', tabBarButtonTestID: 'aba-prontas' }}
      />
      <Tab.Screen
        name="PortfolioTab"
        component={PortfolioStack}
        options={{ title: 'Portfólio', tabBarButtonTestID: 'aba-portfolio' }}
      />
      <Tab.Screen
        name="Encomendar"
        component={EncomendaStack}
        options={{ title: 'Encomendar', tabBarLabel: 'Pedidos', tabBarButtonTestID: 'aba-pedidos' }}
      />
      <Tab.Screen name="Duvidas" component={FaqScreen} options={{ title: 'Dúvidas', tabBarButtonTestID: 'aba-duvidas' }} />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilStack}
        options={{ title: 'Perfil', tabBarButtonTestID: 'aba-perfil' }}
      />
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