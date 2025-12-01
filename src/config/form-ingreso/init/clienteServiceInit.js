import { inicializarClienteService } from '@services/form-ingreso/clientes/ClienteService';
import { proveedorClientes } from '@config/form-ingreso/entorno';
import { mapaProveedoresClientes } from '@config/form-ingreso/proveedores';

const proveedorSeleccionado = mapaProveedoresClientes[proveedorClientes];

if (!proveedorSeleccionado) {
  throw new Error(
    `[clienteServiceInit] ❌ Proveedor inválido: ${proveedorClientes}`
  );
}

inicializarClienteService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] Clientes provider: ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
