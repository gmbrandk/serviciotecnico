import React from 'react';
import BotonAccion from './BotonAccion';
import { accionesEntidad } from './config/accionesEntidad.config';
import toast from 'react-hot-toast';

const BotonAccionEntidad = ({
  entidad,
  usuarioSolicitante,
  onAccion,
  acciones = ['editar', 'softDelete'],
  verificarPermiso = () => ({ permitido: true, mensaje: '' }),
  estadoCargandoPorId = {}, // ✅ nuevo prop
}) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {acciones.map((clave) => {
        const config = accionesEntidad[clave];
        if (!config) return null;

        const { permitido, mensaje } = verificarPermiso({
          solicitante: usuarioSolicitante,
          objetivo: entidad,
          accion: clave,
        });
        console.log(`[FRONTEND]Permiso para:` + clave, { permitido, mensaje });

        const handleClick = () => {
          if (config.requierePermiso && !permitido) {
            toast.error(mensaje);
            return;
          }
          onAccion(clave, entidad);
        };

        const estaDesactivado = config.esAlternante && entidad.activo === false;

        const texto =
          config.esAlternante && estaDesactivado
            ? config.textoAlternativo
            : config.texto;

        const icono =
          config.esAlternante && estaDesactivado ? (
            <config.iconoAlternativo size={16} />
          ) : (
            <config.icono size={16} />
          );

        const tipo =
          config.esAlternante && estaDesactivado
            ? config.tipoAlternativo
            : config.tipo;

        const cargando = estadoCargandoPorId[entidad.id] === true;
        const deshabilitadoVisual = config.requierePermiso ? !permitido : false;

        return (
          <BotonAccion
            key={clave}
            texto={texto}
            icono={icono}
            tipo={tipo}
            onClick={handleClick}
            title={!permitido ? mensaje : config.tooltip}
            deshabilitadoVisual={deshabilitadoVisual}
            cargando={clave === 'eliminarUsuario' ? cargando : false} // ✅ Solo ese botón muestra spinner
          />
        );
      })}
    </div>
  );
};

export default BotonAccionEntidad;
