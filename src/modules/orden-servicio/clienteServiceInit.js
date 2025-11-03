// clienteServiceInit.js
import { proveedorClientes } from './config/entorno';
import { mapaProveedoresClientes } from './config/proveedores';
import { inicializarClienteService } from './services/clienteService';

const proveedorSeleccionado = mapaProveedoresClientes[proveedorClientes];

if (!proveedorSeleccionado) {
  throw new Error(
    `[clienteServiceInit] ❌ Proveedor "${proveedorClientes}" no es válido.`
  );
}

inicializarClienteService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] Clientes (proveedor): ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
