import { verificarPermisoMock } from '@__mock__/verificarPermisoMock';
import AccionesEntidad from '@components/shared/Botones/BotonAccionEntidad';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';
import Spinner from '@components/shared/Spinner';
import Tabla from '@components/shared/Tabla/Tabla';
import { useAuth } from '@context/AuthContext';
import { useUsuarios } from '@context/UsuariosContext';
import useEsMovil from '@hooks/useEsMovil';
import useGlobalLoading from '@hooks/useGlobalLoading';
import useMultiLoading from '@hooks/useMultiLoading';
import { mostrarConfirmacion } from '@services/alerta/alertaService'; // al inicio del archivo
import { showToast } from '@services/toast/toastService';
import { getUsuarioService } from '@services/usuarioService';
import { rwdtableStyles } from '@styles';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/testing/TestingPage.module.css';

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

const TestingPage = () => {
  const esMovil = useEsMovil();
  const navigate = useNavigate();
  const { usuarios, setUsuarios, cargandoUsuarios } = useUsuarios();

  const { usuario: usuarioActual, cargando: cargandoAuth } = useAuth();

  const { resetUsuarios } = useUsuarios();
  const {
    isLoading: cargandoGlobal,
    startLoading: startGlobalLoading,
    stopLoading: stopGlobalLoading,
  } = useGlobalLoading();

  const {
    isLoading: cargandoPorId,
    startLoading: startMultiLoading,
    stopLoading: stopMultiLoading,
  } = useMultiLoading();

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = esMovil ? 1 : 5;

  const service = getUsuarioService();
  const nombreProveedor = service.obtenerNombreProveedor();
  const tipoProveedor = service.obtenerTipoProveedor();

  useEffect(() => {
    startGlobalLoading();
    const timeout = setTimeout(() => stopGlobalLoading(), 800);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [esMovil]);

  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const datosMostrados = usuarios.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const handleEditar = (usuarioObjetivo) => {
    navigate(`/testing/editar/${usuarioObjetivo.id}`);
  };

  const handleReset = async () => {
    const resultado = await resetUsuarios();
    if (resultado.success) {
      toast.success('Usuarios de prueba restaurados correctamente');
    } else {
      toast.error(resultado.mensaje || 'Error al restaurar usuarios');
    }
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
      const service = getUsuarioService();

      const usuarioOriginal = usuarios.find((u) => u.id === usuarioObjetivo.id);
      if (!usuarioOriginal) {
        showToast('Usuario no encontrado en el contexto.', 'error');
        return;
      }

      const respuesta = await service.cambiarEstadoUsuario(usuarioOriginal._id);

      if (respuesta.success) {
        showToast(respuesta.mensaje, 'success');

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuarioObjetivo.id ? { ...u, activo: !u.activo } : u
          )
        );
      } else {
        showToast(respuesta.mensaje || 'Error al actualizar estado', 'error');
      }
    } catch (error) {
      console.error('Error al alternar estado:', error);
      showToast(error.message || 'Error al conectar con el servidor', 'error');
    }
  };

  const renderAcciones = (usuarioObjetivo) => (
    <AccionesEntidad
      entidad={usuarioObjetivo}
      usuarioSolicitante={usuarioActual}
      acciones={['editar', 'softDelete']}
      verificarPermiso={verificarPermisoMock}
      onAccion={async (clave, usuarioObjetivo) => {
        const id = usuarioObjetivo.id;
        if (clave === 'editar') {
          handleEditar(usuarioObjetivo);
          return;
        }
        if (clave === 'softDelete') {
          try {
            startMultiLoading(id);
            await handleToggleActivo(usuarioObjetivo);
          } finally {
            stopMultiLoading(id);
          }
        }
      }}
      estadoCargandoPorId={cargandoPorId[usuarioObjetivo.id]}
    />
  );

  const rowClassNameCallback = crearRowClassNameCallback({
    customConditions: [
      {
        condition: (item) => item.estado === 'pendiente',
        className: 'rowPendiente',
      },
      { condition: (item) => item.estaDeshabilitado, className: 'rowDisabled' },
      {
        condition: (item) => item.estado !== 'activo',
        className: 'ocultarEnMovil',
      },
    ],
  });

  const tipo = tipoProveedor;
  const nombre = nombreProveedor;
  const estiloProveedor = {
    mock: { color: '#fff', icono: '🧪' },
    api: { color: '#3498db', icono: '🌐' },
  }[tipo] || { color: '#95a5a6', icono: '❔' };

  if (cargandoGlobal || cargandoUsuarios || cargandoAuth) {
    return (
      <div className={styles.Container} style={{ padding: 20 }}>
        <Spinner size={50} color="#fff" />
        <p style={{ marginTop: '1rem' }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <h2 style={{ color: estiloProveedor.color }}>
        {estiloProveedor.icono} Usuarios del sistema ({nombre})
      </h2>
      <Tabla
        columns={columns}
        data={datosMostrados}
        renderAcciones={renderAcciones}
        estilos={{ tabla: rwdtableStyles.rwdTable }}
        rowClassNameCallback={rowClassNameCallback}
        onAccionPersonalizada={(clave, usuarioObjetivo) => {
          if (clave === 'editar') handleEditar(usuarioObjetivo);
        }}
      />
      {(tipoProveedor === 'mock' ||
        nombreProveedor?.toLowerCase().includes('mock')) && (
        <button
          onClick={handleReset}
          style={{
            marginTop: '1rem',
            backgroundColor: '#e74c3c',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          🔄 Restaurar usuarios de prueba
        </button>
      )}

      <PaginadorNumeradoInteligente
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
        totalPaginas={totalPaginas}
        maxPaginasVisibles={5}
      />
    </div>
  );
};

export default TestingPage;
