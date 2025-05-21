// @logic/usuarioMockManager.js
import { verificarPermisoMock } from '@__mock__/verificarPermisoMock';

export const toggleActivoMock = ({ usuarios, setUsuarios, usuarioActual, usuarioObjetivo }) => {
  const resultado = verificarPermisoMock({
    solicitante: usuarioActual,
    objetivo: usuarioObjetivo,
    accion: 'eliminarUsuario',
  });

  if (!resultado.permitido) {
    return { success: false, mensaje: resultado.mensaje };
  }

  const usuariosActualizados = usuarios.map((u) =>
    u.id === usuarioObjetivo.id ? { ...u, activo: !u.activo } : u
  );

  setUsuarios(usuariosActualizados);

  return {
    success: true,
    mensaje: usuarioObjetivo.activo
      ? `Usuario ${usuarioObjetivo.nombre} desactivado`
      : `Usuario ${usuarioObjetivo.nombre} reactivado`,
  };
};
