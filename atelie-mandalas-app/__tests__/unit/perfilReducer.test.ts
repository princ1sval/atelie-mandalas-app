import { criarEstadoInicialPerfil, perfilReducer } from '../../src/context/perfilReducer';
import { perfil } from '../helpers/fabricas';

describe('perfilReducer (estado do PerfilContext)', () => {
  test('começa carregando, com o perfil vazio', () => {
    expect(criarEstadoInicialPerfil()).toEqual({
      perfil: { nome: '', whatsapp: '', fotoUri: null },
      carregando: true,
      erro: null,
    });
  });

  test('"carregou" guarda o perfil e para de carregar', () => {
    const ana = perfil({ nome: 'Ana' });
    const estado = perfilReducer(criarEstadoInicialPerfil(), { tipo: 'carregou', perfil: ana });
    expect(estado).toEqual({ perfil: ana, carregando: false, erro: null });
  });

  test('"falhou" guarda a mensagem; "carregando" de novo limpa o erro e mantém o perfil', () => {
    const ana = perfil({ nome: 'Ana' });
    const comPerfil = perfilReducer(criarEstadoInicialPerfil(), { tipo: 'carregou', perfil: ana });
    const falhou = perfilReducer(comPerfil, { tipo: 'falhou', mensagem: 'Deu erro' });
    expect(falhou).toMatchObject({ carregando: false, erro: 'Deu erro', perfil: ana });
    expect(perfilReducer(falhou, { tipo: 'carregando' })).toMatchObject({ carregando: true, erro: null, perfil: ana });
  });

  test('"salvou" troca o perfil sem mexer no carregando e não altera o estado anterior', () => {
    const anterior = perfilReducer(criarEstadoInicialPerfil(), { tipo: 'carregou', perfil: perfil({ nome: 'Ana' }) });
    const novo = perfil({ nome: 'Ana Souza' });
    const estado = perfilReducer(anterior, { tipo: 'salvou', perfil: novo });
    expect(estado.perfil).toBe(novo);
    expect(estado.carregando).toBe(false);
    expect(anterior.perfil.nome).toBe('Ana'); // função pura: o estado antigo continua igual
  });
});
