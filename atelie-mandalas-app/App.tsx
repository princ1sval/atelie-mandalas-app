import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Fraunces_300Light } from '@expo-google-fonts/fraunces/300Light';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Poppins_300Light } from '@expo-google-fonts/poppins/300Light';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { colors, radius, spacing, typography } from './src/view/styles/theme';
import { testarCamadas } from './src/testeCamadas';

export default function App() {
  const [fontesCarregadas, erroFontes] = useFonts({
    Fraunces_300Light,
    Fraunces_400Regular,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    testarCamadas();
  }, []);

  // Enquanto as fontes carregam, mostra um indicador.
  // Se der erro, segue com a fonte do sistema em vez de travar o app.
  if (!fontesCarregadas && !erroFontes) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={colors.primaria} />
      </View>
    );
  }

  // VITRINE TEMPORÁRIA para conferir o tema.
  // Na Etapa 4 este trecho vira a navegação do app.
  const amostras = ['primaria', 'primariaEscura', 'salvia', 'marrom', 'amarelo', 'borda'] as const;

  return (
    <View style={styles.container}>
      <Text style={typography.sobretitulo}>malu mandalas · teste do tema</Text>
      <Text style={typography.titulo}>Identidade visual</Text>
      <Text style={typography.corpo}>
        Se o título está em Fraunces e este texto em Poppins, as fontes carregaram.
      </Text>
      <View style={styles.paleta}>
        {amostras.map((nomeCor) => (
          <View key={nomeCor} style={[styles.amostra, { backgroundColor: colors[nomeCor] }]} />
        ))}
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fundo,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.fundo,
  },
  paleta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amostra: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
});