export function snapshotWizardPayload(payload) {
  if (!payload) return null;

  // Copia profunda segura y explícita
  return {
    ...payload,
    lineasServicio: (payload.lineasServicio || []).map((l) => ({
      ...l, // mantenemos uid tal como viene
      deleted: !!l.deleted,
    })),
  };
}
