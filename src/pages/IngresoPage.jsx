import { ClienteSection } from '@components/form-ingreso/ClienteSection';
import { EquipoSection } from '@components/form-ingreso/EquipoSection';
import { OrdenServicio } from '../components/form-ingreso/OrdenServicio';
import { IngresoFormProvider } from '../context/IngresoFormContext';

export function IngresoPage({ initialData }) {
  return (
    <IngresoFormProvider initialData={initialData}>
      <div className="container">
        <h1>Registro / Edición de Orden de Servicio</h1>

        <fieldset className="collapsible">
          <div className="fieldset-header">
            <h2>Cliente</h2>
            <img src="img/dropdown-arrow.svg" className="arrow-icon" />
          </div>
          <div className="fieldset-content">
            <ClienteSection />
          </div>
        </fieldset>

        <fieldset className="collapsible" style={{ marginTop: 10 }}>
          <div className="fieldset-header">
            <h2>Equipo</h2>
            <img src="img/dropdown-arrow.svg" className="arrow-icon" />
          </div>
          <div className="fieldset-content">
            <EquipoSection />
          </div>
        </fieldset>

        <fieldset className="collapsible" style={{ marginTop: 10 }}>
          <div className="fieldset-header">
            <h2>Orden de servicio</h2>
            <img src="img/dropdown-arrow.svg" className="arrow-icon" />
          </div>
          <div className="fieldset-content">
            <OrdenServicio />
          </div>
        </fieldset>
      </div>
    </IngresoFormProvider>
  );
}
