import { render, screen, userEvent } from '@testing-library/react-native';
import { BotaoPrimario } from '../../src/view/components/BotaoPrimario';

describe('<BotaoPrimario />', () => {
  test('mostra o título como botão e chama onPress ao tocar', async () => {
    const aoTocar = jest.fn();
    await render(<BotaoPrimario titulo="Enviar pedido" onPress={aoTocar} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Enviar pedido' }));

    expect(aoTocar).toHaveBeenCalledTimes(1);
  });

  test('carregando: some o título, fica ocupado e não aceita toque', async () => {
    const aoTocar = jest.fn();
    await render(<BotaoPrimario titulo="Salvar" onPress={aoTocar} carregando />);

    const botao = screen.getByRole('button');
    expect(screen.queryByText('Salvar')).not.toBeOnTheScreen();
    expect(botao).toBeBusy();
    expect(botao).toBeDisabled();
    await userEvent.setup().press(botao);
    expect(aoTocar).not.toHaveBeenCalled();
  });
});
