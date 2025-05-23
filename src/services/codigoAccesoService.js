// codigoAccesoService.js

export const fetchCodigos = async () => {
  const response = await fetch("http://localhost:5000/api/codigos", {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensaje || "Error al cargar los códigos");
  }
  return data.codigos;
};
