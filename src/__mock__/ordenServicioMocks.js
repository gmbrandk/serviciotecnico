export async function mockGetOrdenServicioById(id) {
  // Simulamos un delay como si viniera del backend real
  await new Promise((res) => setTimeout(res, 600));

  return {
    success: true,
    data: {
      representanteId: '690d6f117be85ef8af7b79ce',
      equipoId: '686beee0f64be7dc40967003',
      lineasServicio: [
        {
          tipoTrabajo: '68dc9ac76162927555649baa',
          descripcion: 'Instalación de sistema operativo y programas básicos',
          precioUnitario: '40',
          cantidad: 1,
        },
        {
          tipoTrabajo: '68e335329e1eff2fcb38b733',
          descripcion: 'Reemplazo completo de pantalla LCD',
          precioUnitario: '260',
          cantidad: 1,
        },
      ],
      tecnico: '6811a47aebf66546dbed5910',
      total: 300,
      fechaIngreso: '2025-11-28T15:04:54.987Z',
      diagnosticoCliente: '',
      observaciones: '',
    },
  };
}
