import { useState } from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { CampoTexto } from '../../src/view/components/CampoTexto';

describe('<CampoTexto />', () => {
  test('mostra o rótulo, usa o rótulo como nome acessível e mostra o erro', async () => {
    await render(<CampoTexto rotulo="Seu nome" value="" onChangeText={() => {}} erro="Informe seu nome." />);

    expect(screen.getByText('Seu nome')).toBeOnTheScreen();
    expect(screen.getByLabelText('Seu nome')).toBeOnTheScreen();
    expect(screen.getByText('Informe seu nome.')).toBeOnTheScreen();
  });

  test('o contador acompanha o que a pessoa digita', async () => {
    // Componente com estado, como a tela usa: o value muda a cada letra.
    function CampoComEstado() {
      const [texto, setTexto] = useState('');
      return <CampoTexto rotulo="Ideia" value={texto} onChangeText={setTexto} maxLength={500} mostrarContador />;
    }
    await render(<CampoComEstado />);
    expect(screen.getByText('0/500')).toBeOnTheScreen();

    await userEvent.setup().type(screen.getByLabelText('Ideia'), 'Olá');

    expect(screen.getByLabelText('Ideia')).toHaveDisplayValue('Olá');
    expect(screen.getByText('3/500')).toBeOnTheScreen();
  });
});
