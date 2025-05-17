import { normalizedId } from '@utils/formatters';

export const createRowClassNameCallback = ({
  spotlightId,
  selectedIds = [],
  errorIds = [],
  customConditions = [],
}) => {
  return (item) => {
    const classes = [];

    if (normalizedId(item) === spotlightId) classes.push('spotlight');
    if (selectedIds.includes(normalizedId(item))) classes.push('row-selected');
    if (errorIds.includes(normalizedId(item))) classes.push('row-error');

    for (const { condition, className } of customConditions) {
      if (condition(item)) {
        classes.push(className);
      }
    }

    return classes; // retornamos array
  };
};
