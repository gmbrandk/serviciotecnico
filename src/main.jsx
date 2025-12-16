import '@config/init/usuarioServiceInit'; // ⬅️ debe ir arriba
import { AuthProvider } from '@context/authContext';

import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
