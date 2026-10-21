import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, fonts, fontSizes, radius, spacing, typography } from '../styles/theme';
import { NomeIcone } from '../styles/icons';

// Aceita TODAS as props de um TextInput (value, onChangeText, keyboardType...) + as nossas.
export interface CampoTextoProps extends TextInputProps {
  rotulo?: string;
  erro?: string;
  icone?: NomeIcone;
  formato?: 'retangular' | 'arredondado'; // arredondado = barra de busca
  mostrarContador?: boolean; // mostra "0/500" usando o maxLength
}

export function CampoTexto({
  rotulo,
  erro,
  icone,
  formato = 'retangular',
  mostrarContador = false,
  multiline,
  value,
  maxLength,
  style,
  onFocus,
  onBlur,
  ...resto // o restante das props vai direto para o TextInput
}: CampoTextoProps) {
  const [focado, setFocado] = useState(false);
  const exibirContador = mostrarContador && maxLength !== undefined;

  return (
    <View style={styles.container}>
      {rotulo ? <Text style={typography.rotulo}>{rotulo}</Text> : null}

      <View
        style={[
          styles.caixa,
          formato === 'arredondado' && styles.arredondado,
          multiline && styles.caixaMultilinha,
          focado && styles.focado,
          erro ? styles.comErro : null,
        ]}
      >
        {icone ? <Feather name={icone} size={18} color={colors.textoSuave} /> : null}
        <TextInput
          {...resto}
          value={value}
          maxLength={maxLength}
          multiline={multiline}
          accessibilityLabel={resto.accessibilityLabel ?? rotulo ?? resto.placeholder}
          placeholderTextColor={colors.textoSuave}
          style={[styles.input, multiline && styles.inputMultilinha, style]}
          onFocus={(evento) => {
            setFocado(true);
            onFocus?.(evento); // avisa quem usa o componente, se ele pediu
          }}
          onBlur={(evento) => {
            setFocado(false);
            onBlur?.(evento);
          }}
        />
      </View>

      {erro || exibirContador ? (
        <View style={styles.rodape}>
          <Text style={styles.erro}>{erro ?? ''}</Text>
          {exibirContador ? (
            <Text style={typography.pequeno}>
              {value?.length ?? 0}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  caixa: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: radius.sm,
  },
  arredondado: { borderRadius: radius.pill },
  caixaMultilinha: { alignItems: 'flex-start', paddingVertical: spacing.xs },
  focado: { borderColor: colors.primaria },
  comErro: { borderColor: colors.erro },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: fonts.corpo,
    fontSize: fontSizes.corpo,
    color: colors.texto,
  },
  inputMultilinha: { minHeight: 110, textAlignVertical: 'top' },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  erro: { ...typography.pequeno, flex: 1, color: colors.erro },
});