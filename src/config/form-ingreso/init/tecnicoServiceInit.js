// initTecnicos.js
import { inicializarTecnicosService } from '@services/form-ingreso/tecnicos/tecnicoService';
import { proveedorTecnicos } from '@config/form-ingreso/entorno';
import { mapaProveedoresTecnicos } from '@config/form-ingreso/proveedores';

const proveedorSeleccionado = mapaProveedoresTecnicos[proveedorTecnicos];

if (!proveedorSeleccionado) {
  throw new Error(
    `[tecnicosServiceInit] ❌ Proveedor inválido: ${proveedorTecnicos}`
  );
}

inicializarTecnicosService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] Técnicos provider: ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
