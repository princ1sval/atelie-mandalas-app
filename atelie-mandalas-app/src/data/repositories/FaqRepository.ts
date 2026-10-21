import { PerguntaFaq } from '../../model/Faq';
import { FAQ_MOCK } from '../mocks/faq.mock';
import { esperar } from '../../utils/esperar';

export interface FaqRepository {
  listar(): Promise<PerguntaFaq[]>;
}

export const faqRepository: FaqRepository = {
  async listar() {
    await esperar(200);
    return [...FAQ_MOCK];
  },
};