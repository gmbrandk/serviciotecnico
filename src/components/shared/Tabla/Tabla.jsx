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
  estilos = {},
  itemsPorPagina = 5, // ✅ Valor por defecto
  tipo = 'clasico',
  ocultarEnMovil,
}) => {
  const { tabla, filaAnimacion, paginador: paginadorClases } = estilos;

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
      <table className={tabla || defaultTableStyles.tablaClasica}>
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
          rowClassMap={filaAnimacion}
        />
      </table>

      {totalPaginas > 1 && (
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          estilos={paginadorClases} // ✅ pasamos clases
          tipo={tipo}
          ocultarEnMovil={ocultarEnMovil}
        />
      )}
    </div>
  );
};

export default Tabla;
