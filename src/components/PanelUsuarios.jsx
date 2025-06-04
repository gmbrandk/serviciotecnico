import React, { useState } from 'react';
import Tabla from '@components/shared/Tabla/Tabla';
import BotonAccionEntidad from '@components/shared/Botones/BotonAccionEntidad';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';

import { rwdtableStyles, RwdPaginadorStyles } from '@styles';
import styles from '../styles/CrearCodigo.module.css';

import toast from 'react-hot-toast';
import useEsMovil from '@hooks/useEsMovil';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { verificarPermisoMock } from '@__mock__/verificarPermisoMock';

import { useUsuarios } from '@context/UsuariosContext'; // <-- Importamos el contexto

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
  // Obtengo usuarios y estado de carga desde contexto
  const { usuarios, cargando, cambiarEstadoUsuario } = useUsuarios();

  const [paginaActual, setPaginaActual] = useState(1);

  const esMovil = useEsMovil();
  const itemsPorPagina = esMovil ? 1 : 8;

  const { usuario: usuarioActual, cargando: cargandoAuth } = useAuth();
  const navigate = useNavigate();

  // Ya no necesitamos obtener el servicio ni cargar usuarios localmente

  const handleEditar = (usuarioObjetivo) => {
    navigate(`/dashboard/usuarios/editar/${usuarioObjetivo.id}`);
  };

  const handleToggleActivo = async (usuarioObjetivo) => {
    const confirmar = confirm(
      usuarioObjetivo.activo
        ? `¿Estás seguro de desactivar a ${usuarioObjetivo.nombre}?`
        : `¿Deseas reactivar a ${usuarioObjetivo.nombre}?`
    );
    if (!confirmar) return;

    try {
      // Para toggle activo llamamos a editarUsuario con el nuevo estado
      const nuevoEstado = !usuarioObjetivo.activo;
      const resultado = await cambiarEstadoUsuario(
        usuarioObjetivo.id,
        nuevoEstado
      );

      console.log('[FRONTEND] Resultado final:', resultado);
      console.log('[FRONTEND] Usuario Objetivo:', usuarioObjetivo);
      console.log('[FRONTEND] Datos Actualizados:', nuevoEstado);

      if (resultado.success) {
        toast.success(
          usuarioObjetivo.activo
            ? `${usuarioObjetivo.nombre} fue desactivado`
            : `${usuarioObjetivo.nombre} fue reactivado`
        );
      } else {
        toast.error('Error al actualizar estado');
      }
    } catch (error) {
      toast.error(error.message || 'Error al conectar con el servidor');
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
      <h1 className={styles.title}>Panel de Usuarios</h1>

      <Tabla
        columns={columns}
        data={datosPaginados}
        renderAcciones={renderAcciones}
        estilos={{ tabla: rwdtableStyles.rwdTable }}
        paginacionInterna={false}
        rowClassNameCallback={null}
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
