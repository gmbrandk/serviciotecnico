// @routes/dashboardRoutes.jsx
import { CodigosAccesoProvider } from '@context/codigoAccesoContext';
import UsuariosLayout from '../components/pages/Dashboard/UsuariosLayout';
import CrearCodigo from '@components/CrearCodigo';
import PanelUsuarios from '@components/PanelUsuarios';
import DashboardHome from '@components/pages/Dashboard/DashboardHome';
import CrearClientes from '@components/CrearClientes';
import Historial from '@components/Historial'; // Asegúrate de tener este componente
import NotFound from '@pages/NotFound';
import FormularioEditarUsuario from '@components/pages/Dashboard/Forms/FormularioEditarUsuario';

const dashboardRoutes = [
  {
    path: '',
    element: <DashboardHome />, // Ruta principal, se muestra al acceder a /dashboard
  },
  {
    path: 'clientes',
    element: <CrearClientes />, // Ruta principal, se muestra al acceder a /dashboard
  },
  {
    path: 'codigoacceso',
    element: (
      <CodigosAccesoProvider>
        <CrearCodigo />
      </CodigosAccesoProvider>
    ),
  },
  {
    path: 'usuarios',
    element: <UsuariosLayout />,
    children: [
      {
        index: true,
        element: <PanelUsuarios />,
      },
      {
        path: 'editar/:id',
        element: <FormularioEditarUsuario />,
      },
    ],
  },
  {
    path: 'historial',
    element: <Historial />, // Ruta para Historial
  },
  {
    path: '*',
    element: <NotFound />, // Ruta para cualquier otra cosa que no exista
  },
];

export default dashboardRoutes;
