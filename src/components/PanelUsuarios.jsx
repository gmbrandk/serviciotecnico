import { verificarPermisoMock } from '@__mock__/verificarPermisoMock';
import BotonAccionEntidad from '@components/shared/Botones/BotonAccionEntidad';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';
import Tabla from '@components/shared/Tabla/Tabla';
import { useAuth } from '@context/AuthContext';
import { useUsuarios } from '@context/UsuariosContext';
import useEsMovil from '@hooks/useEsMovil';
import { mostrarConfirmacion } from '@services/alerta/alertaService';
import { RwdPaginadorStyles, rwdtableStyles } from '@styles';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/CrearCodigo.module.css';

// 👇 usa tu servicio con limitador
import { showToast } from '@services/toast/toastService';

const columns = [
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Email', accessor: 'email' },
  { header: 'Rol', accessor: 'role' },
  {
    header: 'Activo',
    accessor: 'activo',
    render: (valor) => (valor ? '✅' : '❌'),
  },
  { header: 'Acciones', esAcciones: true },
];

const PanelUsuarios = () => {
  const { usuarios, cargando, cambiarEstadoUsuario } = useUsuarios();
  const [paginaActual, setPaginaActual] = useState(1);
  const esMovil = useEsMovil();
  const itemsPorPagina = esMovil ? 1 : 8;
  const { usuario: usuarioActual, cargando: cargandoAuth } = useAuth();
  const navigate = useNavigate();

  const handleEditar = (usuarioObjetivo) => {
    navigate(`/dashboard/usuarios/editar/${usuarioObjetivo.id}`);
  };

  const handleToggleActivo = async (usuarioObjetivo) => {
    const confirmar = await mostrarConfirmacion({
      titulo: usuarioObjetivo.activo
        ? `¿Desactivar a ${usuarioObjetivo.nombre}?`
        : `¿Reactivar a ${usuarioObjetivo.nombre}?`,
      texto: usuarioObjetivo.activo
        ? 'El usuario ya no podrá iniciar sesión.'
        : 'El usuario volverá a tener acceso al sistema.',
      confirmButtonText: usuarioObjetivo.activo
        ? 'Sí, desactivar'
        : 'Sí, reactivar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirmar) return;

    try {
      const nuevoEstado = !usuarioObjetivo.activo;
      const resultado = await cambiarEstadoUsuario(
        usuarioObjetivo.id,
        nuevoEstado
      );

      if (resultado.success) {
        showToast(
          'success',
          'Actualización exitosa',
          usuarioObjetivo.activo
            ? `${usuarioObjetivo.nombre} fue desactivado`
            : `${usuarioObjetivo.nombre} fue reactivado`
        );
      }
    } catch (error) {
      showToast('error', 'Error', error.message || 'Error de conexión');
      console.error('[ERROR en handleToggleActivo]', error);
    }
  };

  const renderAcciones = React.useCallback(
    (usuarioObjetivo) => (
      <BotonAccionEntidad
        entidad={usuarioObjetivo}
        usuarioSolicitante={usuarioActual}
        acciones={['editar', 'softDelete']}
        verificarPermiso={verificarPermisoMock}
        onAccion={(accion, entidad) => {
          if (accion === 'editar') handleEditar(entidad);
          else if (accion === 'softDelete') handleToggleActivo(entidad);
        }}
      />
    ),
    [usuarioActual]
  );

  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const datosPaginados = usuarios.slice(
    indiceInicio,
    indiceInicio + itemsPorPagina
  );

  if (cargando || cargandoAuth || !usuarioActual) {
    return <p>Cargando sesión y usuarios...</p>;
  }

  return (
    <div className={styles.container}>
      <Tabla
        columns={columns}
        data={datosPaginados}
        renderAcciones={renderAcciones}
        estilos={{ tabla: rwdtableStyles.rwdTable }}
        paginacionInterna={false}
      />

      {totalPaginas > 1 && (
        <PaginadorNumeradoInteligente
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          esMovil={esMovil}
          estilos={RwdPaginadorStyles}
          maxVisible={5}
        />
      )}
    </div>
  );
};

export default PanelUsuarios;
