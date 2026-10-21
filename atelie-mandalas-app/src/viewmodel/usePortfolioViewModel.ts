import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mandala, NOMES_TEMA } from '../model/Mandala';
import { FiltroTema, MandalaService } from '../services/MandalaService';
import { formatarQuantidade } from '../utils/formatters';

export interface OpcaoFiltro {
  valor: FiltroTema;
  rotulo: string;
}

export interface PortfolioViewModel {
  mandalas: Mandala[]; // já filtradas pelo tema
  opcoesFiltro: OpcaoFiltro[];
  filtro: FiltroTema;
  resumo: string; // ex.: "6 encomendas · todos os temas"
  carregando: boolean;
  erro: string | null;
  selecionarFiltro: (filtro: FiltroTema) => void;
  recarregar: () => void;
}

// Fica fora do hook: as opções nunca mudam, então são criadas uma vez só.
const OPCOES_FILTRO: OpcaoFiltro[] = MandalaService.opcoesDeFiltro();

export function usePortfolioViewModel(): PortfolioViewModel {
  const [todas, setTodas] = useState<Mandala[]>([]);
  const [filtro, setFiltro] = useState<FiltroTema>('todos');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setTodas(await MandalaService.listarPortfolio());
    } catch {
      setErro('Não foi possível carregar o portfólio. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Regra do filtro fica no Service; aqui só guardamos qual está escolhido.
  const mandalas = useMemo(() => MandalaService.filtrarPorTema(todas, filtro), [todas, filtro]);

  const nomeFiltro = filtro === 'todos' ? 'todos os temas' : NOMES_TEMA[filtro];
  const resumo = `${formatarQuantidade(mandalas.length, 'encomenda', 'encomendas')} · ${nomeFiltro}`;

  return {
    mandalas,
    opcoesFiltro: OPCOES_FILTRO,
    filtro,
    resumo,
    carregando,
    erro,
    selecionarFiltro: setFiltro,
    recarregar: carregar,
  };
}