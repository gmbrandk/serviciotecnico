import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizedId } from '@utils/formatters';

import Tabla from '@components/shared/Tabla/Tabla';
import { rwdtableStyles, RwdPaginadorStyles } from '@styles';
import styles from '../styles/testing/TestingPage.module.css';
import toast from 'react-hot-toast';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';
import useEsMovil from '@hooks/useEsMovil';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';

// Nuevos hooks de loading
import useGlobalLoading from '@hooks/useGlobalLoading';
import useMultiLoading from '@hooks/useMultiLoading';

// Servicios
import { localStorageProvider } from '@services/usuarios/providers/localStorageProvider';
import {
  inicializarUsuarioService,
  obtenerUsuarios,
  toggleActivo,
  obtenerNombreProveedor,
  obtenerTipoProveedor,
} from '@services/usuarioService';

import AccionesEntidad from '@components/shared/Botones/BotonAccionEntidad';
import { verificarPermisoMock } from '@__mock__/verificarPermisoMock';

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
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuarios, setUsuarios] = useState([]);

  const { loading: cargando, startLoading, stopLoading } = useGlobalLoading();
  const {
    isLoading: estaCargandoId,
    startLoading: startLoadingId,
    stopLoading: stopLoadingId,
  } = useMultiLoading();

  useEffect(() => {
    const inicializarYObtener = async () => {
      try {
        startLoading();
        inicializarUsuarioService(localStorageProvider, 'Mock Local', 'mock');

        const datos = await obtenerUsuarios();
        const normalizados = datos.map((u) => ({
          ...u,
          id: normalizedId(u),
        }));
        setUsuarios(normalizados);
      } catch (error) {
        console.error('[❌ Error cargando usuarios]', error);
        toast.error('Error al cargar usuarios');
      } finally {
        stopLoading();
      }
    };

    inicializarYObtener();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [esMovil]);

  const itemsPorPagina = esMovil ? 1 : 5;
  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const datosMostrados = usuarios.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const usuarioActual = {
    id: 'Techisaurio',
    role: 'superadministrador',
  };

  const handleEditar = (usuarioObjetivo) => {
    navigate(`/testing/editar/${usuarioObjetivo.id}`);
  };

  const handleToggleActivo = async (usuarioObjetivo) => {
    const confirmar = confirm(
      usuarioObjetivo.activo
        ? `¿Estás seguro de desactivar a ${usuarioObjetivo.nombre}?`
        : `¿Deseas reactivar a ${usuarioObjetivo.nombre}?`
    );
    if (!confirmar) return;

    const id = usuarioObjetivo.id;
    startLoadingId(id);

    const respuesta = await toggleActivo(usuarioObjetivo._id);

    if (respuesta.success) {
      toast.success(respuesta.mensaje);
      const actualizados = await obtenerUsuarios();
      setUsuarios(actualizados.map((u) => ({ ...u, id: normalizedId(u) })));
    } else {
      toast.error(respuesta.mensaje);
    }

    stopLoadingId(id);
  };

  const renderAcciones = (usuarioObjetivo) => {
    const claveUsuario = usuarioObjetivo.id;
    return (
      <AccionesEntidad
        entidad={usuarioObjetivo}
        usuarioSolicitante={usuarioActual}
        acciones={['editar', 'softDelete']}
        verificarPermiso={verificarPermisoMock}
        onAccion={async (clave, usuarioObjetivo) => {
          const id = usuarioObjetivo.id;

          if (clave === 'editar') {
            handleEditar(usuarioObjetivo);
          }

          if (clave === 'softDelete') {
            try {
              startLoading(id);
              await handleToggleActivo(usuarioObjetivo);
            } finally {
              stopLoading(id);
            }
          }
        }}
        estadoCargandoPorId={isLoading} // ✅ nuevo prop
      />
    );
  };

  const rowClassNameCallback = crearRowClassNameCallback({
    customConditions: [
      {
        condition: (item) => item.estado === 'pendiente',
        className: 'rowPendiente',
      },
      {
        condition: (item) => item.estaDeshabilitado,
        className: 'rowDisabled',
      },
      {
        condition: (item) => item.estado !== 'activo',
        className: 'ocultarEnMovil',
      },
    ],
  });

  const tipo = obtenerTipoProveedor();
  const nombre = obtenerNombreProveedor();

  const obtenerEstiloProveedor = (tipo) => {
    switch (tipo) {
      case 'mock':
        return { color: '#fff', icono: '🧪' };
      case 'api':
        return { color: '#3498db', icono: '🌐' };
      default:
        return { color: '#95a5a6', icono: '❔' };
    }
  };

  const { color, icono } = obtenerEstiloProveedor(tipo);

  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div style={{ padding: 20 }} className={styles.Container}>
      <h1>Test Tabla Usuarios</h1>

      <h2
        style={{
          fontWeight: 400,
          fontSize: '1rem',
          color,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
        title={`Esta página usa el proveedor "${nombre}" de tipo "${tipo}"`}
      >
        <span style={{ fontSize: '1.2rem' }}>{icono}</span>
        Datos obtenidos desde: <strong>{nombre}</strong>
      </h2>

      <Tabla
        columns={columns}
        data={datosMostrados}
        estilos={{
          tabla: rwdtableStyles.rwdTable,
          paginador: {
            pagination: RwdPaginadorStyles.pagination,
            ocultarEnMovil: RwdPaginadorStyles.ocultarEnMovil,
          },
        }}
        renderAcciones={renderAcciones}
        rowClassNameCallback={rowClassNameCallback}
      />

      <PaginadorNumeradoInteligente
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        setPaginaActual={setPaginaActual}
        esMovil={esMovil}
        estilos={{
          pagination: RwdPaginadorStyles,
        }}
      />
    </div>
  );
};

export default TestingPage;
