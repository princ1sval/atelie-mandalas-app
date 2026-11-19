import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { iniciais } from '../../utils/texto';
import { colors, fonts } from '../styles/theme';

export interface FotoPerfilProps {
  uri: string | null;
  nome: string; // para as iniciais, quando não há foto
  tamanho?: number; // diâmetro do círculo
}

// Círculo com a foto da cliente ou, sem foto, as iniciais do nome.
// Usado na tela Perfil e na saudação do Início.
export function FotoPerfil({ uri, nome, tamanho = 96 }: FotoPerfilProps) {
  // Se o arquivo da foto não abrir (por exemplo, se sumiu), mostra as iniciais em vez de um
  // círculo vazio. Guarda qual foto falhou: quando chega outra, ela é mostrada normalmente.
  const [fotoComFalha, setFotoComFalha] = useState<string | null>(null);

  // O tamanho vem de fora, então o círculo é calculado aqui (estilo dinâmico).
  const circulo = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };
  const letras = iniciais(nome);

  if (uri && uri !== fotoComFalha) {
    return (
      <Image
        source={{ uri }}
        style={[styles.borda, circulo]}
        onError={() => setFotoComFalha(uri)}
        accessibilityLabel="Foto do perfil"
      />
    );
  }

  return (
    <View
      style={[styles.borda, styles.semFoto, circulo]}
      accessible
      accessibilityLabel={letras ? `Perfil sem foto, iniciais ${letras}` : 'Perfil sem foto'}
    >
      {letras ? (
        <Text style={[styles.iniciais, { fontSize: tamanho * 0.36 }]}>{letras}</Text>
      ) : (
        <Feather name="user" size={tamanho * 0.45} color={colors.primariaEscura} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  borda: { borderWidth: 2, borderColor: colors.salviaClara },
  semFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.salviaClara },
  iniciais: { fontFamily: fonts.titulo, color: colors.primariaEscura },
});
