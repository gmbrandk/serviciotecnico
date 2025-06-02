import { proveedorUsuarios } from '@config/entorno';
import { mapaProveedores } from '@config/proveedores';
import { inicializarUsuarioService } from '@services/usuarioService';

const proveedorSeleccionado = mapaProveedores[proveedorUsuarios];

if (!proveedorSeleccionado) {
  throw new Error(
    `[usuarioServiceInit] ❌ Proveedor "${proveedorUsuarios}" no es válido. Usa "local" o "api".`
  );
}

inicializarUsuarioService(
  proveedorSeleccionado.instancia,
  proveedorSeleccionado.nombre,
  proveedorSeleccionado.tipo
);

console.info(
  `[Init] Usuarios del sistema (proveedor): ${proveedorSeleccionado.nombre} [${proveedorSeleccionado.tipo}]`
);
