export const crearRowClassNameCallback = ({ customConditions = [] }) => {
  return (item) => {
    const clases = [];

    for (const { condition, className } of customConditions) {
      try {
        if (condition(item)) {
          clases.push(className);
        }
      } catch (err) {
        console.warn('Error evaluando condición de clase:', err);
      }
    }

    return clases;
  };
};
