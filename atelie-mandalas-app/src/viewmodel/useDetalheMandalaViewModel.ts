import { useCallback, useEffect, useState } from 'react';
import { Linking, Share } from 'react-native';
import { Mandala, NOMES_TEMA, TemaEncomenda } from '../model/Mandala';
import { AcaoDetalhe, MandalaService } from '../services/MandalaService';
import { AtelieService } from '../services/AtelieService';
import { formatarMoeda } from '../utils/formatters';

export interface InformacaoMandala {
  rotulo: string;
  valor: string;
}

export interface DetalheMandalaViewModel {
  mandala: Mandala | null;
  carregando: boolean;
  erro: string | null;
  aviso: string | null; // mensagem se o WhatsApp não abrir
  origemTexto: string; // "Pronta entrega" ou "Encomenda · Pet"
  precoTexto: string | null; // só pronta entrega
  rotuloSecao: string; // "sobre a peça" ou "a história"
  informacoes: InformacaoMandala[];
  acao: AcaoDetalhe | null;
  executarAcao: () => void;
  compartilhar: () => void;
  recarregar: () => void;
}

// O ViewModel não conhece a navegação: quem usa informa o que fazer no "Quero uma assim".
type AoQuererUmaAssim = (tema: TemaEncomenda | undefined, inspiracaoId: string) => void;

export function useDetalheMandalaViewModel(
  mandalaId: string,
  aoQuererUmaAssim: AoQuererUmaAssim,
): DetalheMandalaViewModel {
  const [mandala, setMandala] = useState<Mandala | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const encontrada = await MandalaService.buscarPorId(mandalaId);
      if (encontrada) {
        setMandala(encontrada);
      } else {
        setErro('Esta mandala não foi encontrada.');
      }
    } catch {
      setErro('Não foi possível carregar a mandala. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, [mandalaId]);

  // Roda de novo se o mandalaId mudar.
  useEffect(() => {
    carregar();
  }, [carregar]);

  // Regra do botão principal: a decisão vem do Service (obterAcaoDetalhe).
  async function executarAcao() {
    if (!mandala) return;
    setAviso(null);

    if (MandalaService.obterAcaoDetalhe(mandala).tipo === 'queroUmaAssim') {
      aoQuererUmaAssim(mandala.tema, mandala.id);
      return;
    }

    try {
      const link = await AtelieService.linkInteresse(mandala);
      await Linking.openURL(link); // abre o WhatsApp (ou o navegador)
    } catch {
      setAviso('Não foi possível abrir o WhatsApp neste aparelho.');
    }
  }

  const compartilhar = useCallback(async () => {
    if (!mandala) return;
    try {
      const mensagem = await AtelieService.textoCompartilhamento(mandala);
      await Share.share({ message: mensagem }); // menu de compartilhar do sistema
    } catch {
      // cancelado ou indisponível: não precisa fazer nada
    }
  }, [mandala]);

  // Textos prontos para a tela: a View só exibe.
  const ehProntaEntrega = mandala?.origem === 'prontaEntrega';

  const informacoes: InformacaoMandala[] = mandala
    ? [
        { rotulo: 'Técnica', valor: mandala.tecnica },
        { rotulo: 'Tamanho', valor: `${mandala.tamanhoCm} cm de diâmetro` },
        ehProntaEntrega
          ? { rotulo: 'Base', valor: mandala.base }
          : { rotulo: 'Tema', valor: mandala.tema ? NOMES_TEMA[mandala.tema] : '—' },
      ]
    : [];

  return {
    mandala,
    carregando,
    erro,
    aviso,
    origemTexto: mandala ? MandalaService.descreverOrigem(mandala) : '',
    precoTexto: mandala?.preco !== undefined ? formatarMoeda(mandala.preco) : null,
    rotuloSecao: ehProntaEntrega ? 'sobre a peça' : 'a história',
    informacoes,
    acao: mandala ? MandalaService.obterAcaoDetalhe(mandala) : null,
    executarAcao,
    compartilhar,
    recarregar: carregar,
  };
}