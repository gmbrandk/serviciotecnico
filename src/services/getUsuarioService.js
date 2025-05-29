export const getUsuarios = async () => {
  const response = await fetch('http://localhost:5000/api/usuarios', {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al cargar usuarios');
  }

  return data.usuarios;
};
