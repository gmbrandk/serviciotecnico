import { ClienteProvider } from '../cliente/ClienteContext';
import { EquipoProvider } from '../equipo/EquipoContext';
import { OrdenServicioApiProvider } from '../ordenServicio/OrdenServicioApiContext';

export function OrdenServicioProviders({ children }) {
  return (
    <ClienteProvider>
      <EquipoProvider>
        <OrdenServicioApiProvider>{children}</OrdenServicioApiProvider>
      </EquipoProvider>
    </ClienteProvider>
  );
}
