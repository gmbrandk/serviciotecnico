// @pages/TestingPage.jsx
import React from 'react';
import TablaDatos from '@components/shared/Tabla/TablaDatos';

const mockData = [
  { id: '1', nombre: 'Juan', correo: 'juan@mail.com' },
  { id: '2', nombre: 'Ana', correo: 'ana@mail.com' },
  { id: '3', nombre: 'Carlos', correo: 'carlos@mail.com' },
];

const columns = [
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Correo', accessor: 'correo' },
];

const TestingPage = () => {
  return (
    <div>
      <h2 style={{ color: '#fff' }}>Tabla Modular</h2>
      <TablaDatos columns={columns} data={mockData} spotlightId={'2'} />
    </div>
  );
};

export default TestingPage;
