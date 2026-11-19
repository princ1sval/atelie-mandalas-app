// Uma leitura do acelerômetro, em "g" (1 g é a gravidade da Terra, 9,81 m/s²).
// Parado em cima da mesa, o celular mede cerca de 1 g, só por causa da gravidade.
export interface LeituraAcelerometro {
  x: number;
  y: number;
  z: number;
}

// Acima deste valor a pessoa está chacoalhando o celular, e não só segurando ou andando com ele.
export const LIMITE_CHACOALHADA_G = 1.8;

// Função pura, sem React: fácil de testar e de explicar.
// A força total é o tamanho do vetor (x, y, z), pelo teorema de Pitágoras em 3D.
export function ehChacoalhada({ x, y, z }: LeituraAcelerometro): boolean {
  const forca = Math.sqrt(x * x + y * y + z * z);
  return forca > LIMITE_CHACOALHADA_G;
}
