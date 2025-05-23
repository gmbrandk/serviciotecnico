// pages/TestingPage.jsx
import React, { useState } from 'react';
import { usuariosMock } from '@__mock__/usuariosMock';
import { normalizedId } from '@utils/formatters';
import { toggleActivoMock } from '@__mock__/usuarioMockManager';
import Tabla from '@components/shared/Tabla/Tabla';
import AccionesUsuario from '@components/shared/Botones/AccionesUsuario';
import { rwdtableStyles,animationSpotlightStyles,paginadorStyles } from '@styles';
import toast from 'react-hot-toast';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';

const columns = [
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Email', accessor: 'email' },
  { header: 'Rol', accessor: 'role' },
  { header: 'Activo', accessor: 'activo', render: (valor) => (valor ? '✅' : '❌') },
  { header: 'Código de Acceso', accessor: 'accessCode' },
  { header: 'Acciones', esAcciones: true },
];

const TestingPage = () => {
  const [usuarios, setUsuarios] = useState(() =>
    usuariosMock.map((usuario) => ({
      ...usuario,
      id: normalizedId(usuario),
    }))
  );

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

    if (!resultado.success) {
      toast.error(resultado.mensaje);
    } else {
      toast.success(resultado.mensaje);
    }
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
        { condition: (item) => item.id === spotlightActivoId, className: 'spotlight' },
        { condition: (item) => item.estaDeshabilitado, className: 'rowDisabled' },
        { condition: (item) => item.estado === 'pendiente', className: 'rowPendiente' },
        { condition: (item) => item.estado !== 'activo', className: 'ocultarEnMovil' }, 
      ],
    });

    console.log(paginadorStyles); // en TestingPage.jsx


  return (
    <div style={{ padding: 20 }}>
      <h1>Test Tabla Usuarios</h1>
      <Tabla
        columns={columns}
        data={usuarios}
        //rowClassNameCallback={rowClassNameCallback}
        //rowClassMap ={animationSpotlightStyles}
        className={rwdtableStyles.rwdTable}
        renderAcciones={renderAcciones}
        /*paginadorClases={{
          pagination: paginadorStyles.pagination,
          ocultarEnMovil: paginadorStyles.ocultarEnMovil,
        }}*/
      />
    </div>
  );
};

export default TestingPage;
