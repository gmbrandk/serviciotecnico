export async function ensureAuth() {
  // 1) Verificar si ya hay sesión válida
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    credentials: 'include',
  });

  if (meRes.ok) {
    const data = await meRes.json();
    console.info('[AUTH] Sesión ya activa');
    return data.usuario; // ← retornamos usuario autenticado
  }

  // 2) Login automático (solo dev)
  console.warn('[AUTH] No hay sesión, intentando login automático...');

  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@example.com',
      password: 'admin123',
    }),
  });

  if (!loginRes.ok) {
    console.error('[AUTH] Error al iniciar sesión automáticamente');
    return null;
  }

  const loginData = await loginRes.json();
  console.info('[AUTH] Sesión iniciada automáticamente');

  return loginData.usuario; // ← aquí también devolvemos usuario
}
