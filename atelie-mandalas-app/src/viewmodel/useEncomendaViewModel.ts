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
  limparEmRecebido?: number,
): EncomendaViewModel {
  const [pedido, setPedido] = useState<PedidoEncomenda>(() =>
    EncomendaService.criarPedidoInicial(temaRecebido, inspiracaoIdRecebida),
  );
  const [inspiracao, setInspiracao] = useState<Mandala | null>(null);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [rascunhoPronto, setRascunhoPronto] = useState(false); // vira true depois de ler o rascunho salvo

  // A aba fica montada: quando chegam parâmetros novos ("Quero uma assim"), atualiza o pedido.
  useEffect(() => {
    setPedido((atual) => ({
      ...atual,
      tema: temaRecebido ?? atual.tema,
      inspiracaoId: inspiracaoIdRecebida,
    }));
  }, [temaRecebido, inspiracaoIdRecebida]);

  // "Apagar meus dados", em Meus pedidos, volta para cá com limparEm. O formulário ficou na memória,
  // embaixo na pilha: sem esvaziá-lo, ele ainda mostraria os dados apagados, e a próxima
  // alteração os gravaria de novo no rascunho.
  useEffect(() => {
    if (limparEmRecebido === undefined) return;
    setPedido(EncomendaService.criarPedidoInicial());
    setTentouEnviar(false);
    setErroEnvio(null);
    setProtocolo(null);
  }, [limparEmRecebido]);

  // Ao abrir, lê o rascunho salvo (seção 3.1).
  useEffect(() => {
    let ativo = true; // se a tela fechar antes de a leitura terminar, a resposta é ignorada
    async function lerRascunho() {
      try {
        const rascunho = await EncomendaService.carregarRascunho();
        if (ativo && rascunho) {
          setPedido((atual) => ({
            ...rascunho,
            // Tema e inspiração que chegaram pelo "Quero uma assim" valem mais que os do rascunho:
            // a cliente acabou de escolher a peça.
            tema: atual.tema ?? rascunho.tema,
            inspiracaoId: atual.inspiracaoId ?? rascunho.inspiracaoId,
          }));
        }
      } catch {
        // Não deu para ler o rascunho: o formulário só começa vazio.
      } finally {
        // Só agora o salvamento pode começar. Antes disso, o formulário ainda vazio apagaria o rascunho.
        if (ativo) setRascunhoPronto(true);
      }
    }
    lerRascunho();
    return () => {
      ativo = false;
    };
  }, []);

  // Salva o rascunho 500 ms depois da última alteração, e não a cada letra digitada.
  // Cada alteração cancela a espera anterior: é o clearTimeout do return.
  useEffect(() => {
    // Não salva antes de ler o rascunho, durante o envio nem com a confirmação aberta.
    if (!rascunhoPronto || enviando || protocolo !== null) return;
    const espera = setTimeout(() => {
      EncomendaService.salvarRascunho(pedido).catch(() => {
        // Se falhar, a cliente só perde a conveniência do rascunho.
      });
    }, 500);
    return () => clearTimeout(espera);
  }, [pedido, rascunhoPronto, enviando, protocolo]);

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

    setEnviando(true); // também pausa o salvamento do rascunho
    try {
      // Quando o envio dá certo, o Service apaga o rascunho.
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