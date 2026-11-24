import { render, screen, userEvent } from '@testing-library/react-native';
import { Chip } from '../../src/view/components/Chip';

describe('<Chip />', () => {
  test('informa se está selecionado e avisa o toque', async () => {
    const aoTocar = jest.fn();
    await render(
      <>
        <Chip rotulo="Pet" selecionado onPress={aoTocar} />
        <Chip rotulo="Casal" selecionado={false} onPress={() => {}} />
      </>,
    );

    expect(screen.getByRole('button', { name: 'Pet' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Casal' })).not.toBeSelected();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Pet' }));
    expect(aoTocar).toHaveBeenCalledTimes(1);
  });
});
