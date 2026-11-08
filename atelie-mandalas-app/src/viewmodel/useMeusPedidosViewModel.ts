import { useCallback, useEffect, useState } from 'react';
import { PedidoSalvo } from '../model/Encomenda';
import { NOMES_TEMA } from '../model/Mandala';
import { EncomendaService } from '../services/EncomendaService';
import { formatarDataHora, formatarFaixaPreco } from '../utils/formatters';

// O que a tela mostra em cada cartão, já em texto.
export interface ItemPedido {
  id: number;
  protocolo: string; // "MM-448397"
  dataTexto: string; // "08/11/2026 às 09:20"
  resumo: string; // "Pet · 30 cm · para presente"
  cores: string | null; // null quando a cliente não informou
  ideia: string;
  estimativaTexto: string; // "R$ 250 a R$ 320 · prazo médio de 20 dias"
  temEstimativa: boolean; // pedidos de antes da migration 2 não têm
}

export interface MeusPedidosViewModel {
  pedidos: ItemPedido[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

// Transforma o pedido salvo no texto de cada cartão.
function paraItem(pedido: PedidoSalvo): ItemPedido {
  const partesResumo = [NOMES_TEMA[pedido.tema], `${pedido.tamanhoCm} cm`];
  if (pedido.presente) partesResumo.push('para presente');

  const { estimativa } = pedido;
  return {
    id: pedido.id,
    protocolo: pedido.protocolo,
    dataTexto: formatarDataHora(pedido.criadoEm),
    resumo: partesResumo.join(' · '),
    cores: pedido.cores.trim() ? pedido.cores.trim() : null,
    ideia: pedido.ideia,
    estimativaTexto: estimativa
      ? `${formatarFaixaPreco(estimativa.precoMinimo, estimativa.precoMaximo)} · prazo médio de ${estimativa.prazoDias} dias`
      : 'Estimativa não registrada',
    temEstimativa: estimativa !== null,
  };
}

export function useMeusPedidosViewModel(): MeusPedidosViewModel {
  const [pedidos, setPedidos] = useState<PedidoSalvo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setPedidos(await EncomendaService.listarPedidos());
    } catch {
      setErro('Não foi possível carregar seus pedidos. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // O Stack cria esta tela de novo a cada vez que ela é aberta,
  // então carregar ao montar já traz o pedido que acabou de ser enviado.
  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    pedidos: pedidos.map(paraItem),
    carregando,
    erro,
    recarregar: carregar,
  };
}
