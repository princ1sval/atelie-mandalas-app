import { render, screen, userEvent } from '@testing-library/react-native';
import { MensagemEstado } from '../../src/view/components/MensagemEstado';

describe('<MensagemEstado />', () => {
  test('erro mostra a mensagem e o "Tentar de novo", que chama o callback', async () => {
    const tentarDeNovo = jest.fn();
    await render(<MensagemEstado tipo="erro" mensagem="Sem conexão." onTentarNovamente={tentarDeNovo} />);

    expect(screen.getByText('Sem conexão.')).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(tentarDeNovo).toHaveBeenCalledTimes(1);
  });

  test('lista vazia mostra só a mensagem, sem botão', async () => {
    await render(<MensagemEstado tipo="vazio" mensagem="Nada por aqui." onTentarNovamente={() => {}} />);

    expect(screen.getByText('Nada por aqui.')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
