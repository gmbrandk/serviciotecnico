// useLineasServicio.js - hook del formulario de ingreso
import { useState } from 'react';

export function useLineasServicio() {
  const [lineas, setLineas] = useState([]);

  /* ======================================================
     ➕ Agregar línea (igual que addLinea() original)
  ====================================================== */
  const agregarLinea = () => {
    setLineas((prev) => [...prev, {}]);
  };

  /* ======================================================
     🗑 Eliminar (igual que delegación del JS)
  ====================================================== */
  const eliminarLinea = (index) => {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  };

  /* ======================================================
     ♻️ Actualizar datos de una línea especifica
  ====================================================== */
  const actualizarLinea = (index, data) => {
    setLineas((prev) => {
      const nuevas = [...prev];
      nuevas[index] = { ...nuevas[index], ...data };
      return nuevas;
    });
  };

  return {
    lineas,
    agregarLinea,
    eliminarLinea,
    actualizarLinea,
  };
}
