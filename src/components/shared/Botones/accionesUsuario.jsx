// components/shared/Botones/AccionesUsuario.jsx
import React from 'react';
import BotonAccion from './BotonAccion';
import { Pencil, Trash2, Undo2 } from 'lucide-react';

const AccionesUsuario = ({ usuario, onEditar, onToggleActivo }) => {
  const esActivo = usuario.activo;
  const textoToggle = esActivo ? 'Eliminar' : 'Reactivar';
  const iconoToggle = esActivo ? <Trash2 size={16} /> : <Undo2 size={16} />;
  const tipoToggle = esActivo ? 'peligro' : 'secundario';

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <BotonAccion
        texto="Editar"
        icono={<Pencil size={16} />}
        tipo="primario"
        onClick={() => onEditar(usuario)}
      />
      <BotonAccion
        texto={textoToggle}
        icono={iconoToggle}
        tipo={tipoToggle}
        onClick={() => onToggleActivo(usuario)}
      />
    </div>
  );
};

export default AccionesUsuario;
