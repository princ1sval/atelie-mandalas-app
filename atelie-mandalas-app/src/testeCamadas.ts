// TESTE TEMPORÁRIO da Etapa 3 — este arquivo será apagado na Etapa 4.
// Chama os services e mostra o resultado no terminal do "npx expo start".
import { MandalaService } from './services/MandalaService';
import { EncomendaService } from './services/EncomendaService';
import { FaqService } from './services/FaqService';
import { AtelieService } from './services/AtelieService';
import { formatarFaixaPreco, formatarMoeda, formatarTelefone } from './utils/formatters';

export async function testarCamadas(): Promise<void> {
  const prontas = await MandalaService.listarProntaEntrega();
  console.log('Pronta entrega:', prontas.map((m) => `${m.nome} (${formatarMoeda(m.preco ?? 0)})`));

  const portfolio = await MandalaService.listarPortfolio();
  console.log('Portfólio:', portfolio.map((m) => m.nome));

  console.log('Busca "ceu":', MandalaService.filtrarPorBusca(prontas, 'ceu').map((m) => m.nome));
  console.log('Busca "azul":', MandalaService.filtrarPorBusca(prontas, 'azul').map((m) => m.nome));
  console.log('Tema família:', MandalaService.filtrarPorTema(portfolio, 'familia').map((m) => m.nome));

  const patinhas = await MandalaService.buscarPorId('enc-patinhas');
  if (patinhas) {
    console.log('Detalhe:', MandalaService.descreverOrigem(patinhas), '->', MandalaService.obterAcaoDetalhe(patinhas).rotulo);
  }

  const pedido = { ...EncomendaService.criarPedidoInicial('pet'), presente: true };
  const estimativa = EncomendaService.estimar(pedido);
  console.log('Estimativa 30 cm + presente:', formatarFaixaPreco(estimativa.precoMinimo, estimativa.precoMaximo), `· ${estimativa.prazoDias} dias`);
  console.log('Erros do pedido vazio:', EncomendaService.validar(pedido));
  console.log('Máscara:', formatarTelefone('32999990000'));

  const perguntas = await FaqService.listarPerguntas();
  console.log('FAQ:', FaqService.montarSecoes(perguntas, '').map((s) => `${s.title} (${s.data.length})`));

  const atelie = await AtelieService.obterInformacoes();
  console.log('Ateliê:', atelie.nome, atelie.instagram);
}