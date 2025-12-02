// tipoTrabajoServiceInit.js
import { proveedorOrdenes } from '@config/form-ingreso/entorno';
import { mapaProveedoresOs } from '@config/form-ingreso/proveedores';
import { inicializarOsService } from '@services/form-ingreso/os/osService';

const proveedorSeleccionado = mapaProveedoresOs[proveedorOrdenes];

if (!proveedorSeleccionado) {
  throw new Error(
    `[osServiceInit] ❌ Proveedor "${proveedorOrdenes}" no es válido.`
  );
}

inicializarOsService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] TiposTrabajo (proveedor): ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
