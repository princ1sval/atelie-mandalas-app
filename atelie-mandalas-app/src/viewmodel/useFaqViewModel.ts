import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { PerguntaFaq, SecaoFaq } from '../model/Faq';
import { FaqService } from '../services/FaqService';
import { AtelieService } from '../services/AtelieService';

export interface FaqViewModel {
  secoes: SecaoFaq[]; // já agrupadas e filtradas pela busca
  busca: string;
  perguntaAbertaId: string | null; // só uma resposta aberta por vez
  carregando: boolean;
  erro: string | null;
  aviso: string | null; // se o WhatsApp não abrir
  alterarBusca: (texto: string) => void;
  alternarPergunta: (id: string) => void;
  chamarNoWhatsApp: () => void;
  recarregar: () => void;
}

export function useFaqViewModel(): FaqViewModel {
  const [perguntas, setPerguntas] = useState<PerguntaFaq[]>([]);
  const [busca, setBusca] = useState('');
  const [perguntaAbertaId, setPerguntaAbertaId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setPerguntas(await FaqService.listarPerguntas());
    } catch {
      setErro('Não foi possível carregar as dúvidas. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Agrupar por categoria e filtrar pela busca é regra do Service.
  const secoes = useMemo(() => FaqService.montarSecoes(perguntas, busca), [perguntas, busca]);

  // Toca na pergunta aberta: fecha. Toca em outra: abre ela (e fecha a anterior).
  function alternarPergunta(id: string) {
    setPerguntaAbertaId((atual) => (atual === id ? null : id));
  }

  async function chamarNoWhatsApp() {
    setAviso(null);
    try {
      await Linking.openURL(await AtelieService.linkDuvida());
    } catch {
      setAviso('Não foi possível abrir o WhatsApp neste aparelho.');
    }
  }

  return {
    secoes,
    busca,
    perguntaAbertaId,
    carregando,
    erro,
    aviso,
    alterarBusca: setBusca,
    alternarPergunta,
    chamarNoWhatsApp,
    recarregar: carregar,
  };
}