import { Autocomplete } from '@components/form-ingreso/Autocomplete';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useClienteDni } from '@hooks/form-ingreso/cliente/useClienteDni';
import { useAutocompleteCliente } from '@hooks/form-ingreso/useAutocompleteCliente';
import { inputsStyles as clienteSectionStyles } from '@styles/form-ingreso';
import { clienteLog } from '../../utils/debug/clienteLogger';

export function ClienteSection() {
  const { cliente, setCliente } = useIngresoForm();

  // 🧠 Dominio
  const { dni, onChangeDni, setDni, lastActionRef } = useClienteDni();

  // 🎨 UX
  const {
    resultados,
    isOpen,
    abrirResultados,
    cerrarResultados,
    seleccionarCliente,
  } = useAutocompleteCliente({
    query: dni,
    setQuery: setDni,
    sourceRef: lastActionRef,
  });

  const handleSelect = async (item) => {
    const full = await seleccionarCliente(item);
    if (!full?._id) return;

    clienteLog('CONFIRM', 'UI', 'cliente-existente', full);
    setCliente(full);
  };

  const activeCliente = cliente;

  return (
    <>
      <div className="row">
        <Autocomplete
          label="DNI"
          inputName="dni"
          query={dni}
          onChange={onChangeDni}
          resultados={resultados}
          isOpen={isOpen}
          onFocus={abrirResultados}
          cerrarResultados={cerrarResultados}
          onSelect={handleSelect}
          renderItem={(c) => (
            <>
              <strong>
                {c.nombres} {c.apellidos}
              </strong>
              <br />
              DNI: {c.dni}
            </>
          )}
        />

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Nombres</label>
          <input
            value={activeCliente?.nombres ?? ''}
            onChange={(e) =>
              setCliente((prev) => ({ ...prev, nombres: e.target.value }))
            }
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Apellidos</label>
          <input
            value={activeCliente?.apellidos ?? ''}
            onChange={(e) =>
              setCliente((prev) => ({ ...prev, apellidos: e.target.value }))
            }
            className={clienteSectionStyles.inputField}
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Teléfono</label>
          <input
            value={activeCliente?.telefono ?? ''}
            onChange={(e) =>
              setCliente((prev) => ({ ...prev, telefono: e.target.value }))
            }
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Email</label>
          <input
            value={activeCliente?.email ?? ''}
            onChange={(e) =>
              setCliente((prev) => ({ ...prev, email: e.target.value }))
            }
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Dirección</label>
          <input
            value={activeCliente?.direccion ?? ''}
            onChange={(e) =>
              setCliente((prev) => ({ ...prev, direccion: e.target.value }))
            }
            className={clienteSectionStyles.inputField}
          />
        </div>
      </div>
    </>
  );
}
