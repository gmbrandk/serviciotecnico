// @routes/dashboardRoutes.jsx
import CrearClientes from '@components/CrearClientes';
import CrearCodigo from '@components/CrearCodigo';
import Historial from '@components/Historial'; // Asegúrate de tener este componente
import PanelUsuarios from '@components/PanelUsuarios';
import DashboardHome from '@components/pages/Dashboard/DashboardHome';
import FormularioEditarUsuario from '@components/pages/Dashboard/Forms/FormularioEditarUsuario';
import { CodigosAccesoProvider } from '@context/codigoAccesoContext';
import { OrdenServicioProviders } from '@context/ordenServicio/ordenServicioProviders';
import NotFound from '@pages/NotFound';
import OrdenServicioPage from '@pages/OrdenServicioPage.jsx';
import UsuariosLayout from '../components/pages/Dashboard/UsuariosLayout';
import IngresoPage from '../pages/form-ingreso/IngresoPage';
import PreviewOSPage from '../pages/form-ingreso/PreviewOSPage';

const dashboardRoutes = [
  {
    path: '',
    element: <DashboardHome />,
  },
  {
    path: 'clientes',
    element: <CrearClientes />,
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
      { index: true, element: <PanelUsuarios /> },
      { path: 'editar/:id', element: <FormularioEditarUsuario /> },
    ],
  },
  {
    path: 'historial',
    element: <Historial />,
  },
  // ✅ NUEVA RUTA
  {
    path: 'orden-servicio',
    element: (
      <OrdenServicioProviders>
        <OrdenServicioPage />
      </OrdenServicioProviders>
    ),
  },
  {
    path: 'orden-servicio/crear/resumen',
    element: (
      <OrdenServicioProviders>
        <IngresoPage />
      </OrdenServicioProviders>
    ),
  },
  {
    path: 'orden-servicio/:id',
    element: (
      <OrdenServicioProviders>
        <PreviewOSPage />
      </OrdenServicioProviders>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default dashboardRoutes;
