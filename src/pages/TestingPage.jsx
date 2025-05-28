import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizedId } from '@utils/formatters';
import Tabla from '@components/shared/Tabla/Tabla';
import toast from 'react-hot-toast';
import { rwdtableStyles, RwdPaginadorStyles } from '@styles';
import styles from '../styles/testing/TestingPage.module.css';
import useEsMovil from '@hooks/useEsMovil';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';
import AccionesEntidad from '@components/shared/Botones/BotonAccionEntidad';
import { verificarPermisoMock } from '@__mock__/verificarPermisoMock';

import Spinner from '@components/shared/Spinner';
import useGlobalLoading from '@hooks/useGlobalLoading';
import useMultiLoading from '@hooks/useMultiLoading';

import { localStorageProvider } from '@services/usuarios/providers/localStorageProvider';
import {
  inicializarUsuarioService,
  obtenerUsuarios,
  toggleActivo,
  obtenerNombreProveedor,
  obtenerTipoProveedor,
} from '@services/usuarioService';

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

  const [usuarios, setUsuarios] = useState([]);

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

  useEffect(() => {
    startGlobalLoading();
  }, []);

  useEffect(() => {
    const inicializarYObtener = async () => {
      try {
        console.log('[DEBUG] Iniciando carga de usuarios...');
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 segundos
        console.log('[DEBUG] Espera artificial completada');

        inicializarUsuarioService(localStorageProvider, 'Mock Local', 'mock');
        const datos = await obtenerUsuarios();
        const normalizados = datos.map((u) => ({ ...u, id: normalizedId(u) }));
        setUsuarios(normalizados);

        console.log('[DEBUG] Usuarios cargados:', normalizados);
      } catch (error) {
        console.error('[DEBUG] Error al cargar usuarios:', error);
        toast.error('Error al cargar usuarios');
      } finally {
        stopGlobalLoading();
        console.log('[DEBUG] Finaliza carga (stopGlobalLoading)');
      }
    };

    inicializarYObtener();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [esMovil]);

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = esMovil ? 1 : 5;
  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const datosMostrados = usuarios.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const usuarioActual = {
    id: '681abeef01f846019099a2b8',
    role: 'administrador',
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

    const respuesta = await toggleActivo(usuarioObjetivo._id);
    if (respuesta.success) {
      toast.success(respuesta.mensaje);
      const actualizados = await obtenerUsuarios();
      setUsuarios(actualizados.map((u) => ({ ...u, id: normalizedId(u) })));
    } else {
      toast.error(respuesta.mensaje);
    }
  };

  const renderAcciones = (usuarioObjetivo) => {
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
  const estiloProveedor = {
    mock: { color: '#fff', icono: '🧪' },
    api: { color: '#3498db', icono: '🌐' },
  }[tipo] || { color: '#95a5a6', icono: '❔' };

  // ✅ Mostrar Spinner con mensaje
  if (cargandoGlobal) {
    console.log('[DEBUG] Mostrando spinner global...');
    return (
      <div
        className={styles.Container}
        style={{ padding: 20, textAlign: 'left' }}
      >
        <Spinner size={50} color="#fff" />
        <p style={{ marginTop: '1rem' }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }} className={styles.Container}>
      <h1>Test Tabla Usuarios</h1>

      <h2
        style={{
          fontWeight: 400,
          fontSize: '1rem',
          color: estiloProveedor.color,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
        title={`Esta página usa el proveedor "${nombre}" de tipo "${tipo}"`}
      >
        <span style={{ fontSize: '1.2rem' }}>{estiloProveedor.icono}</span>
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
