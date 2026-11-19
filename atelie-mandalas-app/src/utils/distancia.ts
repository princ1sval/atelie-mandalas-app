import { Coordenadas } from '../model/Atelie';

const RAIO_DA_TERRA_KM = 6371;

function emRadianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

// Distância em linha reta entre dois pontos do mapa, pela fórmula de Haversine.
// A Terra é quase uma esfera: a fórmula mede o arco entre os pontos pela superfície,
// e não uma reta no papel. Função pura, sem React: fácil de testar e de explicar.
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const dLat = emRadianos(b.latitude - a.latitude);
  const dLon = emRadianos(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(emRadianos(a.latitude)) * Math.cos(emRadianos(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_DA_TERRA_KM * Math.asin(Math.sqrt(h));
}
