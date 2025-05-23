import React, { useState } from 'react'; 
import { TablaHeader, TablaBody, TablaVacia } from '@components/shared/Tabla';
import Paginador from '@components/shared/Paginador';
import { defaultTableStyles } from '@styles';
const Tabla = ({
  columns,
  data,
  onAccionPersonalizada,
  renderAcciones,
  renderBotonAnimar,
  rowEnhancer,
  rowClassNameCallback,
  rowClassMap,
  className,
  paginadorClases = {}, // ✅ nuevo
}) => {
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  const enhancedData = rowEnhancer ? data.map(rowEnhancer) : data;
  const totalPaginas = Math.ceil(enhancedData.length / itemsPorPagina);
  const datosPaginados = enhancedData.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  if (!data.length) return <TablaVacia />;

  const debeMostrarAcciones = !!renderAcciones || !!renderBotonAnimar;

  const columnasFinales = debeMostrarAcciones
    ? columns
    : columns.filter((col) => !col.esAcciones);

  return (
    <div>
      <table className={className || defaultTableStyles.tablaClasica}>
        <TablaHeader columns={columnasFinales} mostrarAcciones={debeMostrarAcciones} />
        <TablaBody
          data={datosPaginados}
          columns={columnasFinales}
          onAccionPersonalizada={onAccionPersonalizada}
          renderAcciones={renderAcciones}
          renderBotonAnimar={renderBotonAnimar}
          rowClassNameCallback={rowClassNameCallback}
          rowClassMap={rowClassMap}
        />
      </table>

      {totalPaginas > 1 && (
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          ocultarEnMovil={true}
          clases={paginadorClases} // ✅ pasamos clases
        />
      )}
    </div>
  );
};

export default Tabla;
