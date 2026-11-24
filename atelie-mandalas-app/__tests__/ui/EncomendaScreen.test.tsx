import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { EncomendaScreen } from '../../src/view/screens/EncomendaScreen';
import { EncomendaScreenProps } from '../../src/navigation/types';
import { navegacaoFalsa, renderComProviders } from '../helpers/renderComProviders';

// A tela de verdade, com o ViewModel, os Services e os contextos de verdade.
// Sem .env, ninguém está logado (jest.setup.ts).
async function abrirEncomenda() {
  const props = { navigation: navegacaoFalsa(), route: { key: 'encomenda', name: 'Encomenda', params: {} } };
  await renderComProviders(<EncomendaScreen {...(props as unknown as EncomendaScreenProps)} />);
  await screen.findByText('Encomende a sua');
}

describe('<EncomendaScreen />', () => {
  test('enviar o formulário vazio mostra os erros dos campos', async () => {
    await abrirEncomenda();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Enviar pedido' }));

    expect(screen.getByText('Confira os campos destacados acima.')).toBeOnTheScreen();
    expect(screen.getByText('Informe seu nome.')).toBeOnTheScreen();
    expect(screen.getByText('Escolha um tema.')).toBeOnTheScreen();
  });

  test('a estimativa muda na hora com o tamanho e o presente', async () => {
    await abrirEncomenda();
    expect(screen.getByText(/235 a R\$\s305/)).toBeOnTheScreen(); // 30 cm, o padrão

    await userEvent.setup().press(screen.getByRole('button', { name: '40 cm' }));
    expect(screen.getByText(/320 a R\$\s410/)).toBeOnTheScreen();
    expect(screen.getByText(/Prazo médio de 25 dias/)).toBeOnTheScreen();

    await fireEvent(screen.getByLabelText('É para presente?'), 'valueChange', true);
    expect(screen.getByText(/335 a R\$\s425/)).toBeOnTheScreen();
  });

  test('formulário certo, mas sem login: convida a entrar e mantém o que foi preenchido', async () => {
    await abrirEncomenda();
    const usuario = userEvent.setup();

    await usuario.type(screen.getByLabelText('Seu nome'), 'Ana Souza');
    await usuario.type(screen.getByLabelText('WhatsApp'), '32999990000');
    await usuario.press(screen.getByRole('button', { name: 'Família' }));
    await usuario.type(screen.getByLabelText('Conte sua ideia'), 'Uma mandala para a família toda.');
    await usuario.press(screen.getByRole('button', { name: 'Enviar pedido' }));

    expect(screen.getByLabelText('WhatsApp')).toHaveDisplayValue('(32) 99999-0000'); // máscara aplicada
    expect(screen.getByText(/Para enviar o pedido, entre na sua conta/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Seu nome')).toHaveDisplayValue('Ana Souza');
  });
});
