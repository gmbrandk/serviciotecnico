import { CollapsibleGroupProvider } from '@context/form-ingreso/CollapsibleGroupContext';
import {
  IngresoFormProvider,
  useIngresoForm,
} from '@context/form-ingreso/IngresoFormContext';

import { ClientesProvider } from '@context/form-ingreso/clientesContext.jsx';
import { EquiposProvider } from '@context/form-ingreso/equiposContext.jsx'; // 👈 AÑADIDO
import { TecnicosProvider } from '@context/form-ingreso/tecnicosContext.jsx';
import { TiposTrabajoProvider } from '@context/form-ingreso/tiposTrabajoContext.jsx';
import { ROLES_PERMITIDOS_EDITAR_TECNICO } from '@utils/form-ingreso/roles.js';

import { PersistSwitch } from '@components/PersistenSwitch.jsx';
import { ClienteSection } from '@components/form-ingreso/ClienteSection.jsx';
import Collapsible from '@components/form-ingreso/Collapsible.jsx';
import { EquipoSection } from '@components/form-ingreso/EquipoSection.jsx';
import { OrdenServicio } from '@components/form-ingreso/OrdenServicioSection.jsx';

import { buttonsStyles, formIngresoPageStyles } from '@styles/form-ingreso';

function IngresoFormContent({ onSubmit, role }) {
  const { cliente, equipo, tecnico, orden, originalRef, submitAndClear } =
    useIngresoForm();

  const handleSubmit = (e) => {
    e.preventDefault();

    const canEditTecnico = ROLES_PERMITIDOS_EDITAR_TECNICO.includes(role);
    const originalTecnico = originalRef.current?.tecnico ?? null;

    const formState = {
      cliente,
      equipo,
      tecnico: canEditTecnico ? tecnico : originalTecnico,
      orden,
    };

    if (onSubmit) onSubmit(formState);
  };

  return (
    <form
      id="formIngreso"
      className={formIngresoPageStyles.msform}
      onSubmit={handleSubmit}
    >
      <h1 className={formIngresoPageStyles.title}>
        Formulario de Ingreso y Diagnóstico Técnico
      </h1>
      <PersistSwitch />

      <CollapsibleGroupProvider>
        <Collapsible
          title="Datos del cliente"
          main
          index={0}
          initMode="expanded"
        >
          <ClienteSection />
        </Collapsible>

        <Collapsible
          title="Datos del equipo"
          main
          index={1}
          initMode="expanded"
        >
          <EquipoSection />{' '}
          {/* ⬅️ ESTE YA TIENE ACCESO AL CONTEXTO DE EQUIPOS */}
        </Collapsible>

        <Collapsible
          title="Orden de servicio"
          main
          index={2}
          initMode="expanded"
        >
          <OrdenServicio role={role} />
        </Collapsible>
      </CollapsibleGroupProvider>

      <div className={buttonsStyles.actions}>
        <button type="submit" className={buttonsStyles.button}>
          💾 Guardar formulario
        </button>
      </div>
    </form>
  );
}

// =================================================================
// 🧠 Componente principal — inicializa TODOS los providers
// =================================================================
export default function FormIngreso({ initialPayload = null, onSubmit, role }) {
  return (
    <ClientesProvider>
      <EquiposProvider>
        <TecnicosProvider>
          <TiposTrabajoProvider>
            <IngresoFormProvider initialPayload={initialPayload}>
              <IngresoFormContent onSubmit={onSubmit} role={role} />
            </IngresoFormProvider>
          </TiposTrabajoProvider>
        </TecnicosProvider>
      </EquiposProvider>
    </ClientesProvider>
  );
}
