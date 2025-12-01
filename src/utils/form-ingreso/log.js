import { LogBuffer } from '@utils/form-ingreso/LogBuffer';

export const log = (category, ...args) => {
  if (!window.DEBUG) return;

  console.log(`%c[${category}]`, 'color:#00bcd4', ...args);

  LogBuffer.push({
    category,
    args,
  });
};
