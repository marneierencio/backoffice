import { PublicLayout } from '@selecao/components/PublicLayout';
import { CandidaturaPage } from '@selecao/pages/CandidaturaPage';
import { ConfirmacaoPage } from '@selecao/pages/ConfirmacaoPage';
import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <CandidaturaPage />,
      },
      {
        path: '/confirmacao',
        element: <ConfirmacaoPage />,
      },
    ],
  },
]);

export const App = () => <RouterProvider router={router} />;
