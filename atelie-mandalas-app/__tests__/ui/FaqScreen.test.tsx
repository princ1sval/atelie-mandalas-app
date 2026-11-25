import { render, screen, userEvent } from '@testing-library/react-native';
import { FaqScreen } from '../../src/view/screens/FaqScreen';

describe('<FaqScreen />', () => {
  test('carrega as perguntas agrupadas e abre a resposta ao tocar', async () => {
    await render(<FaqScreen />);

    const pergunta = await screen.findByRole('button', { name: /Quanto tempo leva uma encomenda/ });
    expect(screen.getByText('Encomendas')).toBeOnTheScreen();
    expect(pergunta).toBeCollapsed();

    await userEvent.setup().press(pergunta);

    expect(pergunta).toBeExpanded();
    expect(screen.getByText(/Ao enviar o pedido você já vê uma estimativa de prazo/)).toBeOnTheScreen();
  });

  test('a busca filtra as perguntas e avisa quando não acha nada', async () => {
    await render(<FaqScreen />);
    await screen.findByText('Quanto tempo leva uma encomenda?');
    const busca = screen.getByPlaceholderText(/Buscar/);
    const usuario = userEvent.setup();

    await usuario.type(busca, 'pagamento');
    expect(screen.getByText('Quais são as formas de pagamento?')).toBeOnTheScreen();
    expect(screen.queryByText('Quanto tempo leva uma encomenda?')).not.toBeOnTheScreen();

    await usuario.clear(busca);
    await usuario.type(busca, 'xyzabc');
    expect(screen.getByText('Nenhuma dúvida encontrada para essa busca.')).toBeOnTheScreen();
  });
});
