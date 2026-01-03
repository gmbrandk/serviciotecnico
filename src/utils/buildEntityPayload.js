// utils/buildEntityPayload.js
export function buildEntityPayload(entity) {
  if (!entity) return null;

  // Si ya existe en DB
  if (entity._id) return entity._id;

  // Si es nuevo
  return {
    ...entity,
  };
}
