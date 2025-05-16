export const columnasCodigos = [
 {
    header: 'Código',
    accessor: 'codigo',
  },
  {
    header: 'Estado',
    accessor: 'estado',
  },
  {
    header: 'Usos restantes',
    accessor: 'usosDisponibles',
  },
  {
    header: 'Fecha',
    accessor: 'fechaCreacion',
    render: (valor) => {
      const fecha = new Date(valor);
      return isNaN(fecha.getTime()) ? 'Fecha inválida' : fecha.toLocaleString();
    },
  },
  {
    header: 'Creado por',
    accessor: 'creadoPor.nombre',
    render: (_, item) => item.creadoPor?.nombre || 'N/A',
  },
  { header: 'Acciones', 
    accessor: 'acciones', 
    esAcciones: true 
  } // <--- esta marca
];

