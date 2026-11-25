import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, Text } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';
import { PerfilProvider, usePerfil } from '../../src/context/PerfilContext';
import { InicioScreen } from '../../src/view/screens/InicioScreen';
import { InicioScreenProps } from '../../src/navigation/types';
import { navegacaoFalsa, renderComProviders } from '../helpers/renderComProviders';
import { perfil } from '../helpers/fabricas';

// Duas "telas" que não se conhecem: uma só lê o perfil, a outra só salva.
// O que liga as duas é o PerfilContext.
function Saudacao() {
  const { perfil: atual, carregando } = usePerfil();
  if (carregando) return <Text>Carregando…</Text>;
  return <Text>{atual.nome ? `Olá, ${atual.nome}!` : 'Sem perfil'}</Text>;
}

function BotaoSalvar() {
  const { salvar } = usePerfil();
  return (
    <Pressable accessibilityRole="button" onPress={() => salvar(perfil({ nome: 'Bia' }))}>
      <Text>Salvar Bia</Text>
    </Pressable>
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('PerfilContext', () => {
  test('o que uma tela salva aparece na outra e fica guardado no aparelho', async () => {
    await render(
      <PerfilProvider>
        <Saudacao />
        <BotaoSalvar />
      </PerfilProvider>,
    );
    expect(await screen.findByText('Sem perfil')).toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Salvar Bia' }));

    expect(await screen.findByText('Olá, Bia!')).toBeOnTheScreen();
    expect(JSON.parse((await AsyncStorage.getItem('@malu-mandalas/perfil')) as string).nome).toBe('Bia');
  });

  test('a Início lê o perfil salvo pelo contexto e mostra a saudação', async () => {
    await AsyncStorage.setItem('@malu-mandalas/perfil', JSON.stringify(perfil({ nome: 'Ana Souza' })));

    const props = { navigation: navegacaoFalsa(), route: {} } as unknown as InicioScreenProps;
    await renderComProviders(<InicioScreen {...props} />);

    expect(await screen.findByRole('button', { name: 'Olá, Ana! Abrir meu perfil' })).toBeOnTheScreen();
  });

  test('usar o hook fora do Provider dá um erro claro', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // o React registra o erro no console
    await expect(render(<Saudacao />)).rejects.toThrow('usePerfil precisa estar dentro de <PerfilProvider>.');
    jest.restoreAllMocks();
  });
});
