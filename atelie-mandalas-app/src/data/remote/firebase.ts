import { Platform } from 'react-native';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { armazenamentoSeguro } from './armazenamentoSeguro';

// Configuração do app Web do Firebase. Os valores vêm do .env (EXPO_PUBLIC_...), que fica fora do git.
const configuracao = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Sem o .env, o app abre do mesmo jeito: o catálogo funciona e só a conta fica indisponível.
export const firebaseConfigurado = Boolean(configuracao.apiKey && configuracao.appId);

function iniciarAuth(app: FirebaseApp): Auth {
  // No navegador, o getAuth já guarda a sessão no armazenamento do próprio navegador.
  if (Platform.OS === 'web') return getAuth(app);
  // No celular, a sessão vai para o SecureStore. Sem persistência, o login sumiria ao fechar o app.
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(armazenamentoSeguro) });
  } catch {
    return getAuth(app); // já iniciado: o Expo recarregou o código e o Auth continua o mesmo
  }
}

// getApps evita iniciar o Firebase duas vezes quando o Expo recarrega o código.
function iniciarFirebase(): Auth {
  const app = getApps().length > 0 ? getApp() : initializeApp(configuracao);
  return iniciarAuth(app);
}

// O Firestore (getFirestore) entra na B5, quando os pedidos forem para a nuvem.
export const auth: Auth | null = firebaseConfigurado ? iniciarFirebase() : null;
