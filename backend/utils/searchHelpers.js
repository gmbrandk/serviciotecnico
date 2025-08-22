// utils/searchHelpers.js
function normalizeDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

function cleanPhone(s) {
  return normalizeDigits(s);
}

// Levenshtein con tope de seguridad (si supera 2, devuelve 99 para no priorizar)
function safeLevenshtein(a, b) {
  a = String(a || '');
  b = String(b || '');
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // early exit si la diferencia de longitudes ya es alta
  if (Math.abs(m - n) > 2) return 99;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      // tope defensivo
      if (dp[i][j] > 2) dp[i][j] = 99;
    }
  }
  return dp[m][n];
}

module.exports = { normalizeDigits, cleanPhone, safeLevenshtein };
