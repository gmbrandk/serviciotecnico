// @utils/tabla/crearRowClassNameCallback.js
export const crearRowClassNameCallback = ({ customConditions = [] } = {}) => {
  return (item) =>
    customConditions.reduce((acc, { condition, className }) => {
      if (condition(item)) acc.push(className);
      return acc;
    }, []);
};
