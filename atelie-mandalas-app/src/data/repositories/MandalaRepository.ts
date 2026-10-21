import { Mandala } from '../../model/Mandala';
import { MANDALAS_MOCK } from '../mocks/mandalas.mock';
import { esperar } from '../../utils/esperar';

// Contrato: o que qualquer fonte de mandalas precisa oferecer.
export interface MandalaRepository {
  listar(): Promise<Mandala[]>;
  buscarPorId(id: string): Promise<Mandala | undefined>;
}

// Implementação atual: lê o arquivo de mock.
// Na Parte 2 só esta implementação muda (API, banco...).
// Services, ViewModels e telas continuam iguais.
export const mandalaRepository: MandalaRepository = {
  async listar() {
    await esperar(300); // imita o tempo de resposta de uma API
    return [...MANDALAS_MOCK]; // devolve uma cópia: ninguém altera o mock original
  },

  async buscarPorId(id) {
    await esperar(200);
    return MANDALAS_MOCK.find((mandala) => mandala.id === id);
  },
};