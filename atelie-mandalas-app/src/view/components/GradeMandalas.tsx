import { FlatList, StyleSheet } from 'react-native';
import { Mandala } from '../../model/Mandala';
import { useGrade } from '../hooks/useGrade';
import { MandalaCard } from './MandalaCard';
import { MensagemEstado } from './MensagemEstado';
import { spacing } from '../styles/theme';

export interface GradeMandalasProps {
  mandalas: Mandala[];
  onAbrirMandala: (mandalaId: string) => void;
  mensagemVazia: string;
}

// Grade de cards (2 colunas no celular, 3 no tablet). Usada na Pronta Entrega e no Portfólio.
export function GradeMandalas({ mandalas, onAbrirMandala, mensagemVazia }: GradeMandalasProps) {
  const { colunas, larguraCard } = useGrade();

  return (
    <FlatList
      key={`grade-${colunas}`} // numColumns não pode mudar "ao vivo": a key nova recria a lista
      data={mandalas}
      keyExtractor={(mandala) => mandala.id}
      numColumns={colunas}
      renderItem={({ item }) => (
        <MandalaCard mandala={item} onPress={() => onAbrirMandala(item.id)} style={{ width: larguraCard }} />
      )}
      columnWrapperStyle={styles.linha}
      contentContainerStyle={styles.lista}
      ListEmptyComponent={<MensagemEstado tipo="vazio" mensagem={mensagemVazia} />}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  lista: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  linha: { gap: spacing.md }, // espaço entre as colunas
});