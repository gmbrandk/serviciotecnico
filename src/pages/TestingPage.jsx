// src/pages/TestingPage.jsx

import ordenesMock from '@__mock__/ordenServicioMock.json';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente';
import { Tabla } from '@components/shared/Tabla';
import useEsMovil from '@hooks/useEsMovil';
import { RwdPaginadorStyles, rwdtableStyles } from '@styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 📌 Formato de fecha preciso
const formatearFechaCompleta = (fechaISO) => {
  const fecha = new Date(fechaISO);

  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

// 📌 columnas (💡 ahora muestra REPRESENTANTE)
const columnsOS = [
  { header: 'Código', accessor: 'codigo' },
  { header: 'Representante', accessor: 'representanteNombre' }, // ← cambiado
  { header: 'Equipo', accessor: 'equipoResumen' },
  { header: 'Estado', accessor: 'estadoOS' },
  {
    header: 'Fecha Ingreso',
    accessor: 'fechaIngreso',
    render: (v) => formatearFechaCompleta(v),
  },
  {
    header: 'Total USD',
    accessor: 'total',
    render: (v) => `USD ${v}`,
  },
  { header: 'Acciones', esAcciones: true },
];

// 📌 normalizador de datos (💡 ahora toma representante REAL del JSON)
const rowEnhancerOS = (orden) => ({
  ...orden,
  representanteNombre: `${orden.representante.nombres} ${orden.representante.apellidos}`,
  equipoResumen: `${orden.equipo.marca} ${orden.equipo.modelo} (${orden.equipo.nroSerie})`,
});

const TestingPage = () => {
  const navigate = useNavigate();
  const esMovil = useEsMovil();
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = esMovil ? 3 : 8;

  const ordenes = ordenesMock.details.ordenes;
  const totalPaginas = Math.ceil(ordenes.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const datosPaginados = ordenes.slice(inicio, inicio + itemsPorPagina);

  // 📌 Acción → Ver vista previa
  const renderAccionesOS = (orden) => (
    <button
      style={{
        padding: '6px 10px',
        background: '#1976d2',
        color: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
      }}
      onClick={() =>
        navigate(`/ospreview/${orden._id}`, {
          state: { orden },
        })
      }
    >
      👁 Ver
    </button>
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🧪 Testing Page</h1>

      <div style={{ marginTop: '2rem' }}>
        <h2>📋 Prueba de Tabla: Órdenes de Servicio</h2>

        <Tabla
          columns={columnsOS}
          data={datosPaginados}
          rowEnhancer={rowEnhancerOS}
          renderAcciones={renderAccionesOS}
          estilos={{ tabla: rwdtableStyles.rwdTable }}
          paginacionInterna={false}
        />

        {totalPaginas > 1 && (
          <PaginadorNumeradoInteligente
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            setPaginaActual={setPaginaActual}
            esMovil={esMovil}
            estilos={RwdPaginadorStyles}
            maxVisible={4}
          />
        )}
      </div>
    </div>
  );
};

export default TestingPage;
