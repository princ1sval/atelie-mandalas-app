import { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

// O pacote firebase/auth entrega ao TypeScript só os tipos da versão de navegador.
// No celular, o Metro usa a versão React Native do pacote, que tem esta função a mais.
// Esta declaração conta isso ao TypeScript (problema conhecido do firebase-js-sdk, issue 8332).
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
