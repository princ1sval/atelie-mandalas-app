import * as SecureStore from 'expo-secure-store';
import { ReactNativeAsyncStorage } from 'firebase/auth';

// O SecureStore só aceita letras, números, ".", "-" e "_" no nome da chave.
// O Firebase usa nomes como "firebase:authUser:<apiKey>:[DEFAULT]", então o resto vira "_".
function chaveSegura(chave: string): string {
  return chave.replace(/[^\w.-]/g, '_');
}

// Onde o Firebase guarda a sessão do login (os tokens) no celular.
// Tokens vão para o SecureStore, criptografados pelo Keychain do iPhone e pelo Keystore do Android,
// como pedem as seções 3.3 e 7.1. O Firebase só precisa destes três métodos, os mesmos do AsyncStorage.
export const armazenamentoSeguro: ReactNativeAsyncStorage = {
  getItem: (chave) => SecureStore.getItemAsync(chaveSegura(chave)),
  setItem: (chave, valor) => SecureStore.setItemAsync(chaveSegura(chave), valor),
  removeItem: (chave) => SecureStore.deleteItemAsync(chaveSegura(chave)),
};
