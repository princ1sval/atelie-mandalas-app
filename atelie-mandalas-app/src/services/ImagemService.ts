import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// O que pode acontecer ao pedir uma foto: veio a imagem, a pessoa desistiu ou negou a permissão.
// Desistir e negar são casos separados porque a tela reage diferente: quem desistiu não precisa de aviso.
export type ResultadoImagem = { tipo: 'foto'; uri: string } | { tipo: 'cancelado' } | { tipo: 'sem-permissao' };

// Foto leve e recortada em quadrado, do formato do círculo do perfil.
const OPCOES: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.6,
};

// O uri devolvido é temporário, fica no cache. Quem guarda a foto de vez é o FotoRepository, no "Salvar".
function paraResultado(resultado: ImagePicker.ImagePickerResult): ResultadoImagem {
  if (resultado.canceled || !resultado.assets[0]) return { tipo: 'cancelado' };
  return { tipo: 'foto', uri: resultado.assets[0].uri };
}

// A foto precisa ser guardada como arquivo, e no navegador não há sistema de arquivos.
function disponivel(): boolean {
  return Platform.OS !== 'web';
}

// Cada recurso pede a própria permissão, na hora em que a pessoa toca no botão.
async function tirarFoto(): Promise<ResultadoImagem> {
  const permissao = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissao.granted) return { tipo: 'sem-permissao' };
  return paraResultado(await ImagePicker.launchCameraAsync(OPCOES));
}

async function escolherDaGaleria(): Promise<ResultadoImagem> {
  const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) return { tipo: 'sem-permissao' };
  return paraResultado(await ImagePicker.launchImageLibraryAsync(OPCOES));
}

export const ImagemService = {
  disponivel,
  tirarFoto,
  escolherDaGaleria,
};
