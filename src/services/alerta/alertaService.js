// src/services/alerta/alertaService.js
import Swal from 'sweetalert2';

export const mostrarConfirmacion = async ({
  titulo = '¿Estás seguro?',
  texto = 'Esta acción no se puede deshacer.',
  icono = 'warning',
  confirmButtonText = 'Sí, continuar',
  cancelButtonText = 'Cancelar',
}) => {
  const resultado = await Swal.fire({
    position: 'top',
    title: titulo,
    text: texto,
    icon: icono,
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#aaa',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  });

  return resultado.isConfirmed;
};

export const mostrarAlerta = (titulo, texto, icono = 'success') => {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    confirmButtonColor: '#3498db',
    confirmButtonText: 'OK',
  });
};

export const mostrarMiniAlerta = (mensaje = 'Listo', icono = 'success') => {
  Swal.fire({
    toast: true,
    position: 'top',
    icon: icono,
    title: mensaje,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: '#f8f9fa',
    color: '#333',
    customClass: {
      popup: 'mini-alerta',
    },
  });
};
