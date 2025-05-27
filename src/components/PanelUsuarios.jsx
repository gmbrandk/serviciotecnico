import React, { useEffect, useState } from 'react';
import Tabla from '@components/shared/Tabla/Tabla';
import AccionesUsuario from '@components/shared/Botones/AccionesUsuario';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';
import { apiProvider } from '@services/usuarios/providers/apiProvider'; // ✅ Usamos provider central
import { rwdtableStyles, RwdPaginadorStyles } from '@styles';
import styles from '../styles/CrearCodigo.module.css';
import toast from 'react-hot-toast';
import useEsMovil from '@hooks/useEsMovil';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const esMovil = useEsMovil();
  const itemsPorPagina = esMovil ? 1 : 8;

  const { usuario: usuarioActual, cargando: cargandoAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const usuarios = await apiProvider.obtenerUsuarios();
        setUsuarios(usuarios);
      } catch (error) {
        toast.error(
          error.response?.data?.mensaje || 'Error al cargar usuarios'
        );
      } finally {
        setCargandoUsuarios(false);
      }
    };

    cargarUsuarios();
  }, []);

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
      const data = await apiProvider.cambiarEstado(
        usuarioObjetivo.id,
        !usuarioObjetivo.activo
      );

      if (data.success) {
        toast.success(data.mensaje);
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuarioObjetivo.id ? { ...u, activo: !u.activo } : u
          )
        );
      } else {
        toast.error(data.mensaje || 'Error al actualizar estado');
      }
    } catch (error) {
      toast.error(error.mensaje || 'Error al conectar con el servidor');
    }
  };

  const renderAcciones = (usuarioObjetivo) => (
    <AccionesUsuario
      usuario={usuarioObjetivo}
      usuarioSolicitante={usuarioActual}
      onEditar={handleEditar}
      onToggleActivo={handleToggleActivo}
    />
  );

  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const datosPaginados = usuarios.slice(
    indiceInicio,
    indiceInicio + itemsPorPagina
  );

  if (cargandoUsuarios || cargandoAuth || !usuarioActual) {
    return <p>Cargando sesión y usuarios...</p>;
  }

  return (
    <div style={{ maxWidth: '500px' }} className={styles.container}>
      <h1 className={styles.title}>Panel de Usuarios</h1>

      <Tabla
        columns={columns}
        data={datosPaginados}
        renderAcciones={renderAcciones}
        estilos={{ tabla: rwdtableStyles.rwdTable }}
        itemsPorPagina={itemsPorPagina}
        tipo="numerado"
        ocultarEnMovil={false}
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
