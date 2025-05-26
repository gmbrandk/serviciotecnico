// @pages/testing/TestingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosMock } from '@__mock__/usuariosMock';
import { normalizedId } from '@utils/formatters';
import { toggleActivoMock } from '@__mock__/usuarioMockManager';
// Quitamos importar verificarPermisoMock aquí, ya no lo usamos en TestingPage

import Tabla from '@components/shared/Tabla/Tabla';
import AccionesUsuario from '@components/shared/Botones/AccionesUsuario';
import { rwdtableStyles, RwdPaginadorStyles } from '@styles';
import styles from '../styles/testing/TestingPage.module.css';
import toast from 'react-hot-toast';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';
import useEsMovil from '@hooks/useEsMovil';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';

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
  const [usuarios, setUsuarios] = useState(() =>
    usuariosMock.map((usuario) => ({
      ...usuario,
      id: normalizedId(usuario),
    }))
  );

  const itemsPorPagina = esMovil ? 1 : 5;
  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina);
  const datosMostrados = usuarios.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [esMovil]);

  const usuarioActual = {
    id: 'Techisaurio',
    role: 'superadministrador',
  };

  // --- NOTA: En esta versión, handleEditar NO valida permisos ni muestra toast.
  // Esa responsabilidad queda en AccionesUsuario para centralizar la lógica.
  const handleEditar = (usuarioObjetivo) => {
    navigate(`/testing/editar/${usuarioObjetivo.id}`);
  };

  const handleToggleActivo = (usuarioObjetivo) => {
    const confirmar = confirm(
      usuarioObjetivo.activo
        ? `¿Estás seguro de desactivar a ${usuarioObjetivo.nombre}?`
        : `¿Deseas reactivar a ${usuarioObjetivo.nombre}?`
    );

    if (!confirmar) return;

    const resultado = toggleActivoMock({
      usuarios,
      setUsuarios,
      usuarioActual,
      usuarioObjetivo,
    });

    resultado.success
      ? toast.success(resultado.mensaje)
      : toast.error(resultado.mensaje);
  };

  // --- Aquí pasamos solo los callbacks y usuario, sin verificar permisos.
  // La validación y el toast quedan en el propio componente de botones.
  const renderAcciones = (usuarioObjetivo) => (
    <AccionesUsuario
      usuario={usuarioObjetivo}
      usuarioSolicitante={usuarioActual} // 👈 nuevo nombre aquí también
      onEditar={handleEditar}
      onToggleActivo={handleToggleActivo}
    />
  );

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

  return (
    <div style={{ padding: 20 }} className={styles.Container}>
      <h1>Test Tabla Usuarios</h1>
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
