// pages/TestingPage.jsx
import React, { useState } from 'react';
import { usuariosMock } from '@__mock__/usuariosMock';
import Tabla from '@components/shared/Tabla/Tabla'; // Ajusta según tu estructura real
import { normalizedId } from '@utils/formatters';
import BotonAccion from '@components/shared/Botones/BotonAccion';
import toast from 'react-hot-toast';
import { rwdtableStyles } from '@styles'
import { Trash2, Undo2, Pencil } from 'lucide-react';

const columns = [
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Email', accessor: 'email' },
  { header: 'Rol', accessor: 'role' },
  { header: 'Activo', accessor: 'activo', render: (valor) => (valor ? '✅' : '❌') },
  { header: 'Código de Acceso', accessor: 'accessCode' }, // opcional
  {
    header: 'Acciones',
    esAcciones: true, // ⚠️ Importante para detectar columna de acciones
  },
];

const TestingPage = () => {
  // Normalizamos el estado inicial para que cada usuario tenga un .id único
  const [usuarios, setUsuarios] = useState(() =>
    usuariosMock.map((usuario) => ({
      ...usuario,
      id: normalizedId(usuario),
    }))
  );

  const desactivarUsuarioMock = (id) => {
    setUsuarios((prev) => {
      const actualizados = prev.map((u) =>
        u.id === id ? { ...u, activo: !u.activo } : u
      );

      const actualizado = actualizados.find((u) => u.id === id);
      const accion = actualizado.activo ? 'Reactivado' : 'Desactivado';
      console.log(`${accion} usuario`, actualizado.id, actualizado.activo);
      toast.success(`Usuario ${accion.toLowerCase()} (mock)`);

      return actualizados;
    });
  };

  const renderAcciones = (usuario) => {
    const esActivo = usuario.activo;

    const textoToggle = esActivo ? 'Eliminar' : 'Reactivar';
    const iconoToggle = esActivo ? <Trash2 size={16} /> : <Undo2 size={16} />;
    const tipoToggle = esActivo ? 'peligro' : 'secundario';

    const handleToggle = () => {
      const confirmacion = confirm(
        esActivo
          ? `¿Estás seguro de desactivar a ${usuario.nombre}?`
          : `¿Deseas reactivar a ${usuario.nombre}?`
      );
      if (confirmacion) {
        desactivarUsuarioMock(usuario.id);
      }
    };

    const handleEditar = () => {
      console.log('Editar usuario', usuario.id);
      // Aquí podrías abrir un modal, navegar, etc.
    };

    return (
      <div className="acciones">
        <span className="iconoAccion">
          <BotonAccion
                texto="Editar"
                icono={<Pencil size={16} />}
                tipo="primario"
                onClick={handleEditar}
              />
        </span>
        <span className="iconoAccion">
          <BotonAccion
                texto={textoToggle}
                icono={iconoToggle}
                tipo={tipoToggle}
                onClick={handleToggle}
              />
        </span>
      </div>
    );
  };


  return (
    <div style={{ padding: 20 }}>
      <h1>Test Tabla Usuarios</h1>
      <Tabla
        columns={columns}
        data={usuarios}  // usamos el estado actualizado con id normalizado
        className={rwdtableStyles.rwdTable}
        renderAcciones={renderAcciones}
      />
    </div>
  );
};

export default TestingPage;
