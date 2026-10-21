import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { CampoTexto } from '../components/CampoTexto';
import { Chip } from '../components/Chip';
import { TituloSecao } from '../components/TituloSecao';
import { colors, radius, spacing } from '../styles/theme';

// VITRINE TEMPORÁRIA (Etapa 5) para testar os componentes.
// Na Etapa 6 esta tela vira a Início de verdade, e o estado vai para o ViewModel.
const TEMAS_TESTE = ['Família', 'Pet', 'Homenagem'];

export function InicioScreen() {
  const [busca, setBusca] = useState('');
  const [nome, setNome] = useState('');
  const [ideia, setIdeia] = useState('');
  const [temaEscolhido, setTemaEscolhido] = useState('Pet');
  const [enviando, setEnviando] = useState(false);

  function simularEnvio() {
    setEnviando(true);
    setTimeout(() => setEnviando(false), 2000);
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        automaticallyAdjustKeyboardInsets // iOS: abre espaço para o teclado e rola até o campo focado
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <TituloSecao
          nivel="tela"
          sobretitulo="teste da etapa 5"
          titulo="Componentes"
          descricao="Vitrine temporária dos componentes autorais."
        />

        <TituloSecao sobretitulo="significado" titulo="O que é uma mandala?" />

        <BotaoPrimario titulo="Tenho interesse" icone="message-circle" onPress={simularEnvio} carregando={enviando} />
        <BotaoPrimario titulo="Encomendar a sua" variante="contorno" onPress={() => {}} />

        <View style={styles.fundoEscuro}>
          <BotaoPrimario titulo="Pronta entrega" variante="cheioClaro" onPress={() => {}} style={styles.metade} />
          <BotaoPrimario titulo="Encomendar" variante="contornoClaro" onPress={() => {}} style={styles.metade} />
        </View>

        <CampoTexto
          formato="arredondado"
          icone="search"
          placeholder="Buscar por nome ou cor"
          value={busca}
          onChangeText={setBusca}
        />
        <CampoTexto
          rotulo="Seu nome"
          placeholder="Como podemos te chamar?"
          value={nome}
          onChangeText={setNome}
          erro={nome.length === 1 ? 'Informe seu nome.' : undefined}
        />
        <CampoTexto
          rotulo="Conte sua ideia"
          placeholder="Para quem é, o que a peça deve representar…"
          value={ideia}
          onChangeText={setIdeia}
          multiline
          maxLength={500}
          mostrarContador
        />

        <View style={styles.linhaChips}>
          {TEMAS_TESTE.map((tema) => (
            <Chip
              key={tema}
              rotulo={tema}
              selecionado={tema === temaEscolhido}
              onPress={() => setTemaEscolhido(tema)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  conteudo: { gap: spacing.lg, padding: spacing.lg },
  fundoEscuro: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primaria,
  },
  metade: { flex: 1 },
  linhaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});