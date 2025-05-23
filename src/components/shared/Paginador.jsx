import React from 'react';
import {defaultPaginadorStyles} from '@styles'; // ✅ Import directo de estilos por defecto

const Paginador = ({
  paginaActual,
  totalPaginas,
  setPaginaActual,
  clases = {},
  ocultarEnMovil = false,
  mostrarRango = true,
  mostrarBotones = true,
  mostrarExtremos = false,
}) => {
  const avanzar = () => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));
  const retroceder = () => setPaginaActual((prev) => Math.max(prev - 1, 1));
  const irPrimera = () => setPaginaActual(1);
  const irUltima = () => setPaginaActual(totalPaginas);

  // Usa las clases por defecto si no vienen desde props
  const contenedorClases = [
    clases.pagination || defaultPaginadorStyles.pagination,
    ocultarEnMovil ? (clases.ocultarEnMovil) : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={contenedorClases}>
      {mostrarBotones && mostrarExtremos && (
        <button onClick={irPrimera} disabled={paginaActual === 1}>« Primera</button>
      )}
      {mostrarBotones && (
        <button onClick={retroceder} disabled={paginaActual === 1}>Anterior</button>
      )}
      {mostrarRango && (
        <span>Página {paginaActual} de {totalPaginas}</span>
      )}
      {mostrarBotones && (
        <button onClick={avanzar} disabled={paginaActual === totalPaginas}>Siguiente</button>
      )}
      {mostrarBotones && mostrarExtremos && (
        <button onClick={irUltima} disabled={paginaActual === totalPaginas}>Última »</button>
      )}
    </div>
  );
};

export default Paginador;
