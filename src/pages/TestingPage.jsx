// pages/TestingPage.jsx
import React, { useState } from 'react';
import { usuariosMock } from '@__mock__/usuariosMock';
import Tabla from '@components/shared/Tabla/Tabla'; // Ajusta según tu estructura real
import { normalizedId } from '@utils/formatters';
import { rwdtableStyles } from '@styles';

export default function TestingPage() {
  // 🔄 Normalizamos la data para que tenga `.id`
  const dataNormalizada = usuariosMock.map((usuario) => ({
    ...usuario,
    id: normalizedId(usuario),
  }));

  // 🧪 Log para validar que cada item tenga `id`
  console.log('🔍 Data normalizada:', dataNormalizada);

  const columns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' },
    { header: 'Rol', accessor: 'role' },
    { header: 'Activo', accessor: 'activo', render: (valor) => valor ? '✅' : '❌' },
    { header: 'Código de Acceso', accessor: 'accessCode' }, // opcional
    {
      header: 'Acciones',
      esAcciones: true, // ⚠️ Importante para detectar columna de acciones
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Tabla Usuarios</h1>
      <Tabla  
        columns={columns} 
        data={dataNormalizada} 
        //className={rwdtableStyles.rwdTable}
      />
    </div>
  );
}
