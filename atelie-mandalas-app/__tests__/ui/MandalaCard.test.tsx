import { render, screen, userEvent } from '@testing-library/react-native';
import { MandalaCard } from '../../src/view/components/MandalaCard';
import { mandala } from '../helpers/fabricas';

describe('<MandalaCard />', () => {
  test('pronta entrega mostra tamanho, base e preço; tocar abre o detalhe', async () => {
    const abrir = jest.fn();
    await render(<MandalaCard mandala={mandala({ nome: 'Céu', preco: 220 })} onPress={abrir} />);

    expect(screen.getByText('30 cm · MDF')).toBeOnTheScreen();
    expect(screen.getByText(/R\$\s220,00/)).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Céu. Ver detalhes' }));
    expect(abrir).toHaveBeenCalled();
  });

  test('peça do portfólio mostra o tema, e não o preço', async () => {
    await render(
      <MandalaCard mandala={mandala({ origem: 'encomenda', tema: 'pet', preco: undefined })} onPress={() => {}} />,
    );

    expect(screen.getByText('Pet')).toBeOnTheScreen();
    expect(screen.queryByText(/R\$/)).not.toBeOnTheScreen();
  });
});
