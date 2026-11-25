import { render, screen } from '@testing-library/react-native';
import { FotoPerfil } from '../../src/view/components/FotoPerfil';

describe('<FotoPerfil />', () => {
  test('sem foto, mostra as iniciais do nome', async () => {
    await render(<FotoPerfil uri={null} nome="Ana Clara Souza" />);

    expect(screen.getByText('AS')).toBeOnTheScreen();
    expect(screen.getByLabelText('Perfil sem foto, iniciais AS')).toBeOnTheScreen();
  });

  test('com foto, mostra a imagem no lugar das iniciais', async () => {
    await render(<FotoPerfil uri="file:///foto.jpg" nome="Ana Souza" />);

    expect(screen.getByLabelText('Foto do perfil')).toBeOnTheScreen();
    expect(screen.queryByText('AS')).not.toBeOnTheScreen();
  });
});
