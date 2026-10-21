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

// Abas: o navegador da raiz do app
export type RootTabParamList = {
  Inicio: undefined;
  ProntaEntregaTab: NavigatorScreenParams<ProntaEntregaStackParamList> | undefined;
  PortfolioTab: NavigatorScreenParams<PortfolioStackParamList> | undefined;
  Encomendar: { tema?: TemaEncomenda; inspiracaoId?: string } | undefined;
  Duvidas: undefined;
};

// ---------- PROPS DE CADA TELA (route + navigation já tipados) ----------

// Telas que ficam direto numa aba
export type InicioScreenProps = BottomTabScreenProps<RootTabParamList, 'Inicio'>;
export type EncomendaScreenProps = BottomTabScreenProps<RootTabParamList, 'Encomendar'>;
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

// O Detalhe é usado pelos DOIS stacks, então ele conhece só a própria rota + as abas.
type DetalheStackParamList = { DetalheMandala: DetalheMandalaParams };

export type DetalheMandalaScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DetalheStackParamList, 'DetalheMandala'>,
  BottomTabScreenProps<RootTabParamList>
>;