import React, { useState } from 'react';
import { TablaHeader, TablaBody, TablaPaginacion, TablaVacia } from '@components/shared/Tabla';

const Tabla = ({
columns,
  data,
  onAccionPersonalizada,
  renderAcciones,
  renderBotonAnimar, // ✅ NUEVO
  rowClassNameCallback,
  rowStyles,
  className,
}) => {
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(data.length / itemsPorPagina);
  const datosPaginados = data.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  if (!data.length) return <TablaVacia />;

  return (
    <div>
      <table className={className}>
        <TablaHeader columns={columns}  mostrarAcciones={!!renderAcciones || !!renderBotonAnimar} />
        <TablaBody
          data={datosPaginados}
          columns={columns}
          onAccionPersonalizada={onAccionPersonalizada}
          renderAcciones={renderAcciones}
          renderBotonAnimar={renderBotonAnimar} // ✅ NUEVO
          rowClassNameCallback={rowClassNameCallback}
          rowStyles={rowStyles}
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
