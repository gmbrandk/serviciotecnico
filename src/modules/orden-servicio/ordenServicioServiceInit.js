// ordenServicioServiceInit.js
import { proveedorOrdenes } from './config/entorno';
import { mapaProveedoresOrdenes } from './config/proveedores';
import { inicializarOrdenServicioService } from './services/ordenServicioService';

const proveedorSeleccionado = mapaProveedoresOrdenes[proveedorOrdenes];

if (!proveedorSeleccionado) {
  throw new Error(
    `[ordenServicioServiceInit] ❌ Proveedor "${proveedorOrdenes}" no es válido.`
  );
}

inicializarOrdenServicioService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] OrdenServicio (proveedor): ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
