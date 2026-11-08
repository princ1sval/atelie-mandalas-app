import { Alert, Platform } from 'react-native';

// Pergunta antes de uma ação que não pode ser desfeita. Devolve true se a pessoa confirmar.
// No celular usa o Alert, como no Snack do material. No navegador o Alert do React Native
// não faz nada, então usa o confirm do próprio navegador.
export function confirmar(titulo: string, mensagem: string, textoAcao: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
  }

  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        // "destructive" deixa o botão vermelho no iPhone: avisa que a ação apaga algo
        { text: textoAcao, style: 'destructive', onPress: () => resolver(true) },
      ],
      // No Android, tocar fora do aviso também conta como cancelar.
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}
