import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

export interface TituloSecaoProps {
  titulo: string;
  sobretitulo?: string; // texto pequeno em caixa-alta acima do título
  descricao?: string;
  nivel?: 'tela' | 'secao'; // 'tela' = título grande do topo; 'secao' = título de bloco, com pontinhos
}

// Tamanhos dos pontinhos decorativos (do maior para o menor), como numa mandala.
const TAMANHOS_PONTOS = [9, 7, 5, 3.5];

export function TituloSecao({ titulo, sobretitulo, descricao, nivel = 'secao' }: TituloSecaoProps) {
  return (
    <View style={styles.container}>
      {sobretitulo ? <Text style={typography.sobretitulo}>{sobretitulo}</Text> : null}

      <Text style={nivel === 'tela' ? typography.titulo : typography.secao} accessibilityRole="header">
        {titulo}
      </Text>

      {nivel === 'secao' ? (
        // Só decoração: escondido dos leitores de tela
        <View style={styles.pontos} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {TAMANHOS_PONTOS.map((tamanho, indice) => (
            <View
              key={tamanho}
              style={[
                styles.ponto,
                {
                  width: tamanho,
                  height: tamanho,
                  backgroundColor: indice === 0 ? colors.marrom : colors.salvia,
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      {descricao ? <Text style={typography.corpo}>{descricao}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  pontos: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ponto: { borderRadius: radius.pill },
});