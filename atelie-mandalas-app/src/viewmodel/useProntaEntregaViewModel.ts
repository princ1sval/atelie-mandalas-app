import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mandala } from '../model/Mandala';
import { MandalaService } from '../services/MandalaService';
import { formatarQuantidade } from '../utils/formatters';

// Contrato do ViewModel: tudo o que a tela pode LER (estado) e FAZER (ações).
export interface ProntaEntregaViewModel {
  mandalas: Mandala[]; // já filtradas pela busca
  busca: string;
  resumo: string; // ex.: "6 peças disponíveis"
  carregando: boolean;
  erro: string | null;
  alterarBusca: (texto: string) => void;
  recarregar: () => void;
}

export function useProntaEntregaViewModel(): ProntaEntregaViewModel {
  const [todas, setTodas] = useState<Mandala[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Busca os dados no Service (que busca no Repository). A tela nem sabe que isso existe.
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setTodas(await MandalaService.listarProntaEntrega());
    } catch {
      setErro('Não foi possível carregar as peças. Tente novamente.');
    } finally {
      setCarregando(false); // roda dando certo ou errado
    }
  }, []);

  // Carrega uma vez, quando a tela aparece pela primeira vez.
  useEffect(() => {
    carregar();
  }, [carregar]);

  // Valores DERIVADOS: recalculados só quando a lista ou a busca mudam.
  const mandalas = useMemo(() => MandalaService.filtrarPorBusca(todas, busca), [todas, busca]);

  const resumo =
    busca.trim() === ''
      ? formatarQuantidade(mandalas.length, 'peça disponível', 'peças disponíveis')
      : formatarQuantidade(mandalas.length, 'peça encontrada', 'peças encontradas');

  return {
    mandalas,
    busca,
    resumo,
    carregando,
    erro,
    alterarBusca: setBusca,
    recarregar: carregar,
  };
}