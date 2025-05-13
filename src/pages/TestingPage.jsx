import React, { useState } from 'react';
import TablaDatos from '@components/shared/Tabla/TablaDatos';
import {
  productos,
  trabajadores,
  mascotas,
  inventarioElectronica,
} from '@mock/mockData';
import styles from '../styles/testing/TestingPage.module.css';

const rubros = {
  productos: {
    titulo: 'Productos',
    datos: productos,
    columnas: [
      { header: 'Nombre', accessor: 'nombre' },
      { header: 'Precio', accessor: 'precio' },
    ],
  },
  trabajadores: {
    titulo: 'Trabajadores',
    datos: trabajadores,
    columnas: [
      { header: 'Nombre', accessor: 'nombre' },
      { header: 'Turno', accessor: 'turno' },
    ],
  },
  mascotas: {
    titulo: 'Mascotas',
    datos: mascotas,
    columnas: [
      { header: 'Nombre', accessor: 'nombre' },
      { header: 'Vacuna', accessor: 'vacuna' },
    ],
  },
  inventario: {
    titulo: 'Inventario Electrónica',
    datos: inventarioElectronica,
    columnas: [
      { header: 'Nombre', accessor: 'nombre' },
      { header: 'Cantidad', accessor: 'cantidad' },
      { header: 'Marca', accessor: 'marca' },
    ],
  },
};

const TestingPage = () => {
  const [rubroActual, setRubroActual] = useState('productos');
  const [datosActuales, setDatosActuales] = useState(rubros['productos'].datos);

  const { titulo, columnas } = rubros[rubroActual];

  const cambiarRubro = (nuevoRubro) => {
    setRubroActual(nuevoRubro);
    setDatosActuales(rubros[nuevoRubro].datos);
  };

  const vaciarDatos = () => {
    setDatosActuales([]);
  };
  return (
    <div style={{ padding: '2rem' }} className={styles.Container}>
      <h2 style={{ color: '#fff' }}>{titulo}</h2>
      <div style={{ marginBottom: '1rem' }}>
        {Object.keys(rubros).map((rubroKey) => (
          <button
            key={rubroKey}
            onClick={() => cambiarRubro(rubroKey)}
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: rubroActual === rubroKey ? '#2980b9' : '#34495e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {rubros[rubroKey].titulo}
          </button>
        ))}
        <button
          onClick={vaciarDatos}
          disabled={datosActuales.length === 0}
           style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: datosActuales.length !== 0 ? '#34495e': '#7f8c8d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
        >
          Vaciar datos
        </button>
      </div>

      <TablaDatos columns={columnas} data={datosActuales} />
    </div>
  );
};

export default TestingPage;
