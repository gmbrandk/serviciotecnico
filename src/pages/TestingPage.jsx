import React, { useState } from 'react';
import TablaDatos from '@components/shared/Tabla/TablaDatos';
import {
  productos,
  trabajadores,
  mascotas,
  inventarioElectronica,
} from '@mock/mockData';
import { testingStyles, buttonStyles } from '@styles';

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
    <div className={testingStyles.Container}>
      <h2 style={{ color: '#fff' }}>{titulo}</h2>

      <div className={buttonStyles.botones}>
        {Object.keys(rubros).map((rubroKey) => (
          <button
            key={rubroKey}
            onClick={() => cambiarRubro(rubroKey)}
            className={`${buttonStyles.boton} ${
              rubroActual === rubroKey ? buttonStyles.activo : ''
            }`}
          >
            {rubros[rubroKey].titulo}
          </button>
        ))}

        <button
          onClick={vaciarDatos}
          disabled={datosActuales.length === 0}
          className={`${buttonStyles.boton} ${buttonStyles.vaciar}`}
        >
          {datosActuales.length === 0 ? 'Restaurar datos' : 'Vaciar datos'}
        </button>
      </div>

      <TablaDatos columns={columnas} data={datosActuales} />
    </div>
  );
};

export default TestingPage;
