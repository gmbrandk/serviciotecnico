import React, { useState, useEffect } from 'react';
import { usuariosMock } from '@__mock__/usuariosMock';
import { normalizedId } from '@utils/formatters';
import { toggleActivoMock } from '@__mock__/usuarioMockManager';
import Tabla from '@components/shared/Tabla/Tabla';
import AccionesUsuario from '@components/shared/Botones/AccionesUsuario';
import { rwdtableStyles, paginadorStyles } from '@styles';
import styles from '../styles/testing/TestingPage.module.css';
import toast from 'react-hot-toast';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';
import useEsMovil from '@hooks/useEsMovil';
import Paginador from '../components/shared/Paginador';

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

  // Reiniciar la página si cambia el modo
  useEffect(() => {
    setPaginaActual(1);
  }, [esMovil]);

  const usuarioActual = {
    id: 'Techisaurio',
    role: 'superadministrador',
  };

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

  const renderAcciones = (usuario) => (
    <AccionesUsuario
      usuario={usuario}
      onEditar={handleEditar}
      onToggleActivo={handleToggleActivo}
    />
  );

  const rowClassNameCallback = crearRowClassNameCallback({
    customConditions: [
      {
        condition: (item) => item.id === spotlightActivoId,
        className: 'spotlight',
      },
      { condition: (item) => item.estaDeshabilitado, className: 'rowDisabled' },
      {
        condition: (item) => item.estado === 'pendiente',
        className: 'rowPendiente',
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
            pagination: paginadorStyles.pagination,
            ocultarEnMovil: paginadorStyles.ocultarEnMovil,
          },
        }}
        renderAcciones={renderAcciones}
        /*itemsPorPagina={itemsPorPagina}
        tipo="numerado"*/
      />

      {totalPaginas > 1 && (
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          estilos={{
            pagination: paginadorStyles.pagination,
            ocultarEnMovil: paginadorStyles.ocultarEnMovil,
          }}
          ocultarEnMovil={false}
          mostrarExtremos={true}
          tipo="clasico"
        />
      )}
    </div>
  );
};

export default TestingPage;
