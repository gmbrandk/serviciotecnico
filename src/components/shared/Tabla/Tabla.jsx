import React, { useState } from 'react'; 
import { TablaHeader, TablaBody, TablaPaginacion, TablaVacia } from '@components/shared/Tabla';
import { defaultTableStyles } from '@styles';
const Tabla = ({
  columns,
  data,
  onAccionPersonalizada,
  renderAcciones,
  renderBotonAnimar, // ✅ NUEVO
  rowEnhancer,
  rowClassNameCallback,
  rowClassMap,
  className,
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

  // ✅ NUEVO: lógica para mostrar columna Acciones sólo si es necesario
  const debeMostrarAcciones = !!renderAcciones || !!renderBotonAnimar;

  const columnasFinales = debeMostrarAcciones
    ? columns
    : columns.filter((col) => !col.esAcciones);

  return (
    <div>
      <table className={className || defaultTableStyles.tablaClasica}>
        <TablaHeader
          columns={columnasFinales}
          mostrarAcciones={debeMostrarAcciones}
        />
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
        <TablaPaginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
        />
      )}
    </div>
  );
};

export default Tabla;
