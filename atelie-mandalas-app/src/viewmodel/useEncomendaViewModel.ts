import { useEffect, useState } from 'react';
import { ErrosPedido, PedidoEncomenda, TamanhoEncomenda } from '../model/Encomenda';
import { Mandala, NOMES_TEMA, TemaEncomenda } from '../model/Mandala';
import { EncomendaService, LIMITE_IDEIA, TAMANHOS_ENCOMENDA } from '../services/EncomendaService';
import { MandalaService } from '../services/MandalaService';
import { formatarFaixaPreco, formatarTelefone } from '../utils/formatters';

export interface OpcaoTema {
  valor: TemaEncomenda;
  rotulo: string;
}

export interface EncomendaViewModel {
  pedido: PedidoEncomenda;
  erros: ErrosPedido; // só aparecem depois da primeira tentativa de envio
  opcoesTema: OpcaoTema[];
  tamanhos: TamanhoEncomenda[];
  limiteIdeia: number;
  inspiracao: Mandala | null;
  inspiracaoTexto: string; // "Patinhas · tema Pet"
  faixaPreco: string; // "R$ 250 a R$ 320"
  prazoTexto: string;
  enviando: boolean;
  mensagemFormulario: string | null; // aviso perto do botão de enviar
  protocolo: string | null; // preenchido quando o pedido é enviado
  atualizarCampo: <K extends keyof PedidoEncomenda>(campo: K, valor: PedidoEncomenda[K]) => void;
  alterarWhatsapp: (texto: string) => void;
  removerInspiracao: () => void;
  enviar: () => void;
  novoPedido: () => void;
}

// Opções dos chips de tema (fixas, criadas uma vez só).
const OPCOES_TEMA: OpcaoTema[] = (Object.keys(NOMES_TEMA) as TemaEncomenda[]).map((valor) => ({
  valor,
  rotulo: NOMES_TEMA[valor],
}));

export function useEncomendaViewModel(
  temaRecebido?: TemaEncomenda,
  inspiracaoIdRecebida?: string,
): EncomendaViewModel {
  const [pedido, setPedido] = useState<PedidoEncomenda>(() =>
    EncomendaService.criarPedidoInicial(temaRecebido, inspiracaoIdRecebida),
  );
  const [inspiracao, setInspiracao] = useState<Mandala | null>(null);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [protocolo, setProtocolo] = useState<string | null>(null);

  // A aba fica montada: quando chegam parâmetros novos ("Quero uma assim"), atualiza o pedido.
  useEffect(() => {
    setPedido((atual) => ({
      ...atual,
      tema: temaRecebido ?? atual.tema,
      inspiracaoId: inspiracaoIdRecebida,
    }));
  }, [temaRecebido, inspiracaoIdRecebida]);

  // Busca a mandala que inspirou o pedido sempre que o id mudar.
  useEffect(() => {
    const id = pedido.inspiracaoId;
    if (!id) {
      setInspiracao(null);
      return;
    }
    let ativo = true; // se o id mudar antes da resposta chegar, ignoramos a resposta antiga
    MandalaService.buscarPorId(id).then((mandala) => {
      if (ativo) setInspiracao(mandala ?? null);
    });
    return () => {
      ativo = false;
    };
  }, [pedido.inspiracaoId]);

  // Uma função para todos os campos: o TypeScript garante que o valor combina com o campo.
  function atualizarCampo<K extends keyof PedidoEncomenda>(campo: K, valor: PedidoEncomenda[K]) {
    setPedido((atual) => ({ ...atual, [campo]: valor }));
  }

  function alterarWhatsapp(texto: string) {
    atualizarCampo('whatsapp', formatarTelefone(texto)); // aplica a máscara enquanto digita
  }

  function removerInspiracao() {
    atualizarCampo('inspiracaoId', undefined);
  }

  async function enviar() {
    setTentouEnviar(true); // a partir daqui os erros aparecem
    setErroEnvio(null);
    if (EncomendaService.temErros(EncomendaService.validar(pedido))) return;

    setEnviando(true);
    try {
      const confirmacao = await EncomendaService.enviar(pedido);
      setProtocolo(confirmacao.protocolo);
    } catch {
      setErroEnvio('Não foi possível enviar o pedido. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  function novoPedido() {
    setPedido(EncomendaService.criarPedidoInicial());
    setTentouEnviar(false);
    setErroEnvio(null);
    setProtocolo(null);
  }

  // ---------- Valores derivados (recalculados a cada mudança no pedido) ----------
  const erros: ErrosPedido = tentouEnviar ? EncomendaService.validar(pedido) : {};
  const estimativa = EncomendaService.estimar(pedido);

  const mensagemFormulario =
    tentouEnviar && EncomendaService.temErros(erros) ? 'Confira os campos destacados acima.' : erroEnvio;

  const inspiracaoTexto = !inspiracao
    ? ''
    : inspiracao.tema
      ? `${inspiracao.nome} · tema ${NOMES_TEMA[inspiracao.tema]}`
      : inspiracao.nome;

  return {
    pedido,
    erros,
    opcoesTema: OPCOES_TEMA,
    tamanhos: TAMANHOS_ENCOMENDA,
    limiteIdeia: LIMITE_IDEIA,
    inspiracao,
    inspiracaoTexto,
    faixaPreco: formatarFaixaPreco(estimativa.precoMinimo, estimativa.precoMaximo),
    prazoTexto: `Prazo médio de ${estimativa.prazoDias} dias · o valor final é combinado com a Malu`,
    enviando,
    mensagemFormulario,
    protocolo,
    atualizarCampo,
    alterarWhatsapp,
    removerInspiracao,
    enviar,
    novoPedido,
  };
}