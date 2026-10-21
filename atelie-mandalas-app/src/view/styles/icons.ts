import { ComponentProps } from 'react';
import Feather from '@expo/vector-icons/Feather';

// Tipo com todos os nomes de ícone do Feather: 'home' | 'search' | 'grid' | ...
// Usado nas props dos componentes e nas abas.
export type NomeIcone = ComponentProps<typeof Feather>['name'];