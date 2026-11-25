import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import { SessaoProvider } from '../../src/context/SessaoContext';
import { PerfilProvider } from '../../src/context/PerfilContext';

// Os mesmos Providers do App.tsx, para as telas que leem a sessão e o perfil.
function ProvidersDoApp({ children }: { children: ReactNode }) {
  return (
    <SessaoProvider>
      <PerfilProvider>{children}</PerfilProvider>
    </SessaoProvider>
  );
}

export function renderComProviders(elemento: ReactElement) {
  return render(elemento, { wrapper: ProvidersDoApp });
}

// Navegação falsa: as telas recebem navigation e route por props.
export function navegacaoFalsa() {
  return { navigate: jest.fn(), setParams: jest.fn(), goBack: jest.fn() };
}
