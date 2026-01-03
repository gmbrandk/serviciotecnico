let __CLIENTE_SEQ__ = 0;

export function clienteLog(tag, who, why, payload = {}) {
  __CLIENTE_SEQ__ += 1;

  console.log(
    `%c[CLIENTE ${__CLIENTE_SEQ__}] ${tag} | ${who} | ${why}`,
    'color:#00bcd4;font-weight:bold',
    payload
  );
}
