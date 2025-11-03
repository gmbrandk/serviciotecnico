// equipoServiceInit.js
import { proveedorEquipos } from './config/entorno';
import { mapaProveedoresEquipos } from './config/proveedores';
import { inicializarEquipoService } from './services/equipoService';

const proveedorSeleccionado = mapaProveedoresEquipos[proveedorEquipos];

if (!proveedorSeleccionado) {
  throw new Error(
    `[equipoServiceInit] ❌ Proveedor "${proveedorEquipos}" no es válido.`
  );
}

inicializarEquipoService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] Equipos (proveedor): ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
