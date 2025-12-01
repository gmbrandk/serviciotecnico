// initEquipos.js (o donde inicializas servicios)
import { inicializarEquiposService } from '@services/form-ingreso/equipos/equipoService';
import { proveedorEquipos } from '@config/form-ingreso/entorno';
import { mapaProveedoresEquipos } from '@config/form-ingreso/proveedores';

const proveedorSeleccionado = mapaProveedoresEquipos[proveedorEquipos];

if (!proveedorSeleccionado) {
  throw new Error(
    `[equiposServiceInit] ❌ Proveedor inválido: ${proveedorEquipos}`
  );
}

inicializarEquiposService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] Equipos provider: ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
