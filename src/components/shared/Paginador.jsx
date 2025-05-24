import React from 'react';
import { defaultPaginadorStyles } from '@styles'; // ✅ Import directo de estilos por defecto

const Paginador = ({
  paginaActual,
  totalPaginas,
  setPaginaActual,
  estilos = {},
  ocultarEnMovil = false,
  mostrarRango = true,
  mostrarBotones = true,
  mostrarExtremos = false,
  tipo = 'clasico', // 👈 nueva prop
}) => {
  const avanzar = () =>
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));
  const retroceder = () => setPaginaActual((prev) => Math.max(prev - 1, 1));
  const irPrimera = () => setPaginaActual(1);
  const irUltima = () => setPaginaActual(totalPaginas);

  const contenedorClases = [
    estilos.pagination || defaultPaginadorStyles.pagination,
    ocultarEnMovil ? estilos.ocultarEnMovil : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={contenedorClases}>
      {tipo === 'clasico' && (
        <>
          {mostrarBotones && mostrarExtremos && (
            <button onClick={irPrimera} disabled={paginaActual === 1}>
              « Primera
            </button>
          )}
          {mostrarBotones && (
            <button onClick={retroceder} disabled={paginaActual === 1}>
              Anterior
            </button>
          )}
          {mostrarRango && (
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
          )}
          {mostrarBotones && (
            <button onClick={avanzar} disabled={paginaActual === totalPaginas}>
              Siguiente
            </button>
          )}
          {mostrarBotones && mostrarExtremos && (
            <button onClick={irUltima} disabled={paginaActual === totalPaginas}>
              Última »
            </button>
          )}
        </>
      )}

      {tipo === 'numerado' && (
        <>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              className={paginaActual === i + 1 ? 'activo' : ''}
            >
              {i + 1}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default Paginador;
