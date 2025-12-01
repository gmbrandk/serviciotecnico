// tipoTrabajoServiceInit.js
import { inicializarTiposTrabajoService } from '@services/form-ingreso/tiposTrabajo/tiposTrabajoService';
import { proveedorTiposTrabajo } from '@config/form-ingreso/entorno';
import { mapaProveedoresTiposTrabajo } from '@config/form-ingreso/proveedores';

const proveedorSeleccionado =
  mapaProveedoresTiposTrabajo[proveedorTiposTrabajo];

if (!proveedorSeleccionado) {
  throw new Error(
    `[tiposTrabajoServiceInit] ❌ Proveedor "${proveedorTiposTrabajo}" no es válido.`
  );
}

inicializarTiposTrabajoService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] TiposTrabajo (proveedor): ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
