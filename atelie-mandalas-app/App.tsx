import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Fraunces_300Light } from '@expo-google-fonts/fraunces/300Light';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Poppins_300Light } from '@expo-google-fonts/poppins/300Light';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { AppNavigator } from './src/navigation/AppNavigator';
import { temaNavegacao } from './src/navigation/temaNavegacao';
import { colors } from './src/view/styles/theme';

export default function App() {
  const [fontesCarregadas, erroFontes] = useFonts({
    Fraunces_300Light,
    Fraunces_400Regular,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Enquanto as fontes carregam, mostra um indicador.
  // Se der erro, segue com a fonte do sistema em vez de travar o app.
  if (!fontesCarregadas && !erroFontes) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={colors.primaria} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={temaNavegacao}>
        <AppNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fundo,
  },
});