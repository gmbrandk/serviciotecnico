import React from 'react';
import BotonAccion from './BotonAccion';
import { accionesEntidad } from '@components/shared/Botones/config/accionesEntidad.config';
import toast from 'react-hot-toast';

const BotonAccionEntidad = ({
  entidad,
  usuarioSolicitante,
  onAccion,
  acciones = ['editar', 'softDelete'],
  verificarPermiso = () => ({ permitido: true, mensaje: '' }),
  estadoCargandoPorId = {}, // ✅ viene del componente padre
}) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {acciones.map((clave) => {
        const config = accionesEntidad[clave];
        if (!config) {
          console.warn(`Acción "${clave}" no reconocida`);
          return null;
        }

        const { permitido, mensaje } = verificarPermiso({
          solicitante: usuarioSolicitante,
          objetivo: entidad,
          accion: clave,
        });

        const estaDesactivado = config.esAlternante && entidad.activo === false;

        const texto = estaDesactivado ? config.textoAlternativo : config.texto;
        const icono = estaDesactivado ? (
          <config.iconoAlternativo size={16} />
        ) : (
          <config.icono size={16} />
        );
        const tipo = estaDesactivado ? config.tipoAlternativo : config.tipo;

        const cargando = estadoCargandoPorId?.[entidad.id]?.[clave] ?? false;

        const handleClick = () => {
          if (config.requierePermiso && !permitido) {
            toast.error(mensaje);
            return;
          }
          onAccion(clave, entidad);
        };

        return (
          <BotonAccion
            key={clave}
            texto={texto}
            icono={icono}
            tipo={tipo}
            onClick={handleClick}
            title={!permitido ? mensaje : config.tooltip}
            deshabilitadoVisual={config.requierePermiso && !permitido}
            cargando={cargando} // ✅ ahora sí
          />
        );
      })}
    </div>
  );
};

export default BotonAccionEntidad;
