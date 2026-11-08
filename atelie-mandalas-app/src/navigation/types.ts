import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TemaEncomenda } from '../model/Mandala';

// ---------- LISTAS DE ROTAS (nome da rota -> parâmetros que ela recebe) ----------
// undefined = a rota não recebe parâmetros.
// Parâmetros sempre simples: passamos o ID, nunca o objeto inteiro.

export type DetalheMandalaParams = { mandalaId: string };

// Stack dentro da aba "Pronta entrega"
export type ProntaEntregaStackParamList = {
  ProntaEntrega: undefined;
  DetalheMandala: DetalheMandalaParams;
};

// Stack dentro da aba "Portfólio"
export type PortfolioStackParamList = {
  Portfolio: undefined;
  DetalheMandala: DetalheMandalaParams;
};

// Parâmetros opcionais do formulário.
// tema e inspiracaoId chegam pelo "Quero uma assim".
// limparEm chega do "Apagar meus dados": é a hora do pedido, um número novo a cada vez,
// para o efeito que esvazia o formulário rodar de novo mesmo que já tenha rodado antes.
export type EncomendaParams = { tema?: TemaEncomenda; inspiracaoId?: string; limparEm?: number };

// Stack dentro da aba "Encomendar": o formulário e, por cima dele, o histórico.
export type EncomendaStackParamList = {
  Encomenda: EncomendaParams | undefined;
  MeusPedidos: undefined;
};

// Abas: o navegador da raiz do app
export type RootTabParamList = {
  Inicio: undefined;
  ProntaEntregaTab: NavigatorScreenParams<ProntaEntregaStackParamList> | undefined;
  PortfolioTab: NavigatorScreenParams<PortfolioStackParamList> | undefined;
  Encomendar: NavigatorScreenParams<EncomendaStackParamList> | undefined;
  Duvidas: undefined;
};

// ---------- PROPS DE CADA TELA (route + navigation já tipados) ----------

// Telas que ficam direto numa aba
export type InicioScreenProps = BottomTabScreenProps<RootTabParamList, 'Inicio'>;
export type FaqScreenProps = BottomTabScreenProps<RootTabParamList, 'Duvidas'>;

// Telas dentro de um Stack que está dentro de uma aba:
// CompositeScreenProps junta a navegação do Stack com a das abas.
export type ProntaEntregaScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProntaEntregaStackParamList, 'ProntaEntrega'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PortfolioScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PortfolioStackParamList, 'Portfolio'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type EncomendaScreenProps = CompositeScreenProps<
  NativeStackScreenProps<EncomendaStackParamList, 'Encomenda'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type MeusPedidosScreenProps = CompositeScreenProps<
  NativeStackScreenProps<EncomendaStackParamList, 'MeusPedidos'>,
  BottomTabScreenProps<RootTabParamList>
>;

// O Detalhe é usado pelos DOIS stacks, então ele conhece só a própria rota + as abas.
type DetalheStackParamList = { DetalheMandala: DetalheMandalaParams };

export type DetalheMandalaScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DetalheStackParamList, 'DetalheMandala'>,
  BottomTabScreenProps<RootTabParamList>
>;