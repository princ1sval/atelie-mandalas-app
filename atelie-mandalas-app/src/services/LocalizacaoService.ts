import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { AtelieService } from './AtelieService';
import { distanciaKm } from '../utils/distancia';

// O que pode acontecer ao pedir a localização. Cada caso tem um aviso diferente na tela,
// no mesmo estilo do ImagemService: desistir, negar e falhar não são a mesma coisa.
export type ResultadoLocalizacao =
  | { tipo: 'ok'; cidade: string; distanciaKm: number }
  | { tipo: 'sem-permissao' }
  | { tipo: 'gps-desligado' }
  | { tipo: 'falhou' };

// No navegador o expo-location não transforma coordenadas em cidade (o reverseGeocodeAsync dá erro).
// Lá a cliente digita a cidade.
function disponivel(): boolean {
  return Platform.OS !== 'web';
}

// "Muriaé" + "MG" -> "Muriaé – MG". No Android a cidade às vezes vem no campo subregion.
function nomeDaCidade(endereco: Location.LocationGeocodedAddress | undefined): string | null {
  const cidade = endereco?.city ?? endereco?.subregion;
  if (!cidade) return null;
  return endereco?.region ? `${cidade} – ${endereco.region}` : cidade;
}

// Pede a localização uma vez, quando a cliente toca no botão, e só com o app aberto (primeiro plano).
// Localização em segundo plano pediria outra permissão e não tem uso no app.
// As coordenadas servem só para achar a cidade e a distância e são descartadas aqui:
// o app guarda só a cidade, nunca onde a pessoa estava (seção 7.3).
async function buscarCidade(): Promise<ResultadoLocalizacao> {
  if (!(await Location.hasServicesEnabledAsync())) return { tipo: 'gps-desligado' };

  const permissao = await Location.requestForegroundPermissionsAsync();
  if (!permissao.granted) return { tipo: 'sem-permissao' };

  // Balanced: precisão de quarteirão, mais rápida e econômica que a máxima. Para a cidade, sobra.
  const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const aqui = { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude };

  const [endereco] = await Location.reverseGeocodeAsync(aqui);
  const cidade = nomeDaCidade(endereco);
  if (!cidade) return { tipo: 'falhou' };

  const atelie = await AtelieService.obterInformacoes();
  return { tipo: 'ok', cidade, distanciaKm: distanciaKm(aqui, atelie.coordenadas) };
}

export const LocalizacaoService = {
  disponivel,
  buscarCidade,
};
