import { useAuth } from '@context/authContext';
import { OrdenServicioWizard } from '@modules/orden-servicio/components/OrdenServicioWizard.jsx';
import { OrdenServicioProvider } from '@modules/orden-servicio/context/OrdenServicioContext.jsx';
import { baseOrden } from '@modules/orden-servicio/domain/constants';

const OrdenServicioPage = () => {
  const { usuario, cargando } = useAuth();

  // Mientras carga el contexto
  if (cargando) {
    return <div>Cargando sesión...</div>;
  }

  // Si no hay usuario autenticado
  if (!usuario) {
    return <div>No hay usuario autenticado.</div>;
  }

  const tecnicoId = usuario._id;

  return (
    <OrdenServicioProvider
      defaults={baseOrden}
      onEvent={(type, payload) => console.log(`[📡 EVENT] ${type}`, payload)}
    >
      <OrdenServicioWizard tecnicoId={tecnicoId} />
    </OrdenServicioProvider>
  );
};

export default OrdenServicioPage;
