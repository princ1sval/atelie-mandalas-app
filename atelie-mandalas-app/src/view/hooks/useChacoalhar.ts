import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Accelerometer } from 'expo-sensors';
import { ehChacoalhada } from '../../utils/movimento';

const INTERVALO_MS = 100; // 10 leituras por segundo
const PAUSA_MS = 1000; // depois de uma chacoalhada, espera 1 s para não disparar duas vezes

// Liga o acelerômetro enquanto a tela está visível e chama aoChacoalhar a cada chacoalhada.
// Devolve se o aparelho tem o sensor, para a tela decidir se mostra a dica.
// Fica em view/hooks porque o movimento é uma entrada da pessoa, como um toque na tela.
export function useChacoalhar(aoChacoalhar: () => void): boolean {
  const [disponivel, setDisponivel] = useState(false);

  // Guarda sempre a função mais nova, sem precisar religar o sensor a cada vez que a tela desenha.
  const aoChacoalharRef = useRef(aoChacoalhar);
  useEffect(() => {
    aoChacoalharRef.current = aoChacoalhar;
  }, [aoChacoalhar]);

  // No navegador, o expo-sensors lê a orientação da tela, e não aceleração de verdade, e o
  // isAvailableAsync responde true mesmo sem sensor, porque o Chrome dispara um evento vazio.
  // Por isso a web fica de fora: lá a dica não aparece e o sensor nunca é ligado.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let ativo = true;
    Accelerometer.isAvailableAsync()
      .then((tem) => {
        if (ativo) setDisponivel(tem);
      })
      .catch(() => {
        // Sem sensor, sem dica.
      });
    return () => {
      ativo = false;
    };
  }, []);

  // useFocusEffect liga o sensor quando a tela ganha foco e desliga quando ela perde
  // (outra aba ou o Detalhe por cima). Sem isso, o sensor ficaria ligado nas outras abas,
  // gastando bateria e abrindo mandalas quando a cliente nem está nesta tela.
  useFocusEffect(
    useCallback(() => {
      if (!disponivel) return;
      let ultimaVez = 0;
      Accelerometer.setUpdateInterval(INTERVALO_MS);
      const assinatura = Accelerometer.addListener((leitura) => {
        const agora = Date.now();
        if (ehChacoalhada(leitura) && agora - ultimaVez > PAUSA_MS) {
          ultimaVez = agora;
          aoChacoalharRef.current();
        }
      });
      return () => assinatura.remove();
    }, [disponivel]),
  );

  return disponivel;
}
