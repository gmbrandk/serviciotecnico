// pages/TestingPage.jsx
import React, { useEffect, useState } from 'react';
import Tabla from '@components/shared/Tabla/Tabla';
import AccionesUsuario from '@components/shared/Botones/AccionesUsuario';
import { rwdtableStyles, paginadorStyles } from '@styles';
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
  { header: 'Código de Acceso', accessor: 'accessCode' },
  { header: 'Acciones', esAcciones: true },
];

const PanelUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const esMovil = useEsMovil();
  const itemsPorPagina = esMovil ? 3 : 8;

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

    // Aquí deberás integrar eliminarUsuarioService cuando esté listo.
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

  return (
    <div style={{ padding: 20 }} className={styles.container}>
      <h1 className={styles.title}>Panel de Usuarios</h1>
      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : (
        <Tabla
          columns={columns}
          data={usuarios}
          renderAcciones={renderAcciones}
          estilos={{
            tabla: rwdtableStyles.rwdTable,
            paginador: {
              pagination: paginadorStyles.pagination,
              ocultarEnMovil: paginadorStyles.ocultarEnMovil,
            },
          }}
          itemsPorPagina={itemsPorPagina} // ✅ inyectado dinámicamente
          tipo="numerado"
          ocultarEnMovil={false}
        />
      )}
    </div>
  );
};

export default PanelUsuarios;
