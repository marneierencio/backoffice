import { PublicLayout } from '@selecao/components/PublicLayout';
import { ConfirmacaoPage } from '@selecao/pages/ConfirmacaoPage';
import { ProcessoSeletivoPage } from '@selecao/pages/ProcessoSeletivoPage';
import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <ProcessoSeletivoPage />,
      },
      {
        path: '/confirmacao',
        element: <ConfirmacaoPage />,
      },
    ],
  },
]);

export const App = () => <RouterProvider router={router} />;
