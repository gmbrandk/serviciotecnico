// utils/fakeObjectId.js
export function fakeObjectId() {
  // genera 24 caracteres hexadecimales
  return Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
