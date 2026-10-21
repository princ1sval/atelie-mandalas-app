import { Atelie } from '../../model/Atelie';
import { ATELIE_MOCK } from '../mocks/atelie.mock';
import { esperar } from '../../utils/esperar';

export interface AtelieRepository {
  obter(): Promise<Atelie>;
}

export const atelieRepository: AtelieRepository = {
  async obter() {
    await esperar(150);
    return ATELIE_MOCK;
  },
};