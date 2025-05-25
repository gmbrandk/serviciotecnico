import React, { useEffect, useState } from 'react';
import Tabla from '@components/shared/Tabla/Tabla';
import AccionesUsuario from '@components/shared/Botones/AccionesUsuario';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente'; // ✅ IMPORTACIÓN

import { rwdtableStyles, RwdPaginadorStyles } from '@styles';
import styles from '../styles/CrearCodigo.module.css';
import toast from 'react-hot-toast';
import { normalizedId } from '@utils/formatters';
import { getUsuarios } from '@services/getUsuarioService';
import useEsMovil from '@hooks/useEsMovil';

const columns = [
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Email', accessor: 'email' },
  { header: 'Rol', accessor: 'role' },
  {
    header: 'Activo',
    accessor: 'activo',
    render: (valor) => (valor ? '✅' : '❌'),
  },
  /*{ header: 'Código de Acceso', accessor: 'accessCode' },*/
  { header: 'Acciones', esAcciones: true },
];

const PanelUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1); // ✅
  const esMovil = useEsMovil();
  const itemsPorPagina = esMovil ? 1 : 8;

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const usuariosBackend = await getUsuarios();
        const normalizados = usuariosBackend.map((usuario) => ({
          ...usuario,
          id: normalizedId(usuario),
        }));
        setUsuarios(normalizados);
      } catch (error) {
        toast.error(error.message || 'Error al cargar usuarios');
      } finally {
        setCargando(false);
      }
    };

    cargarUsuarios();
  }, []);

  const handleEditar = (usuario) => {
    console.log('Editar usuario', usuario);
  };

  const handleToggleActivo = (usuarioObjetivo) => {
    const confirmar = confirm(
      usuarioObjetivo.activo
        ? `¿Estás seguro de desactivar a ${usuarioObjetivo.nombre}?`
        : `¿Deseas reactivar a ${usuarioObjetivo.nombre}?`
    );

    if (!confirmar) return;

    toast.success(
      'Simulación de activar/desactivar completada (falta backend)'
    );
  };

  const renderAcciones = (usuario) => (
    <AccionesUsuario
      usuario={usuario}
      onEditar={handleEditar}
      onToggleActivo={handleToggleActivo}
    />
  );

  // ✅ PAGINACIÓN MANUAL
  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const datosPaginados = usuarios.slice(
    indiceInicio,
    indiceInicio + itemsPorPagina
  );

  return (
    <div style={{ maxWidth: '500px' }} className={styles.container}>
      <h1 className={styles.title}>Panel de Usuarios</h1>
      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : (
        <>
          <Tabla
            columns={columns}
            data={datosPaginados}
            renderAcciones={renderAcciones}
            estilos={{
              tabla: rwdtableStyles.rwdTable,
            }}
            itemsPorPagina={itemsPorPagina}
            tipo="numerado"
            ocultarEnMovil={false}
          />

          {/* ✅ PAGINADOR DEBAJO */}
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
        </>
      )}
    </div>
  );
};

export default PanelUsuarios;
