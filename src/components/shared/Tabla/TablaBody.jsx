import React from 'react';

const TablaBody = ({
  data,
  columns,
  renderAcciones,
  rowClassNameCallback,
  rowClassMap, // puede ser string o objeto CSS Module
}) => {
  return (
    <tbody>
      {data.map((item) => {
        const classKeys = rowClassNameCallback?.(item) || [];

        let rowClass = '';

        if (typeof rowClassMap === 'string') {
          // Caso clase fija para todas las filas
          rowClass = rowClassMap;
        } else if (
          typeof rowClassMap === 'object' &&
          rowClassMap !== null &&
          Array.isArray(classKeys)
        ) {
          // Caso clase condicional según callback y mapa de clases
          rowClass = classKeys
            .map((key) => rowClassMap[key] || key)
            .filter(Boolean)
            .join(' ');
        }

        return (
          <tr key={item.id} className={rowClass}>
            {columns.map((col, index) => {
              if (col.esAcciones && renderAcciones) {
                return (
                  <td key={index} data-th={col.header}>
                    {renderAcciones(item)}
                  </td>
                );
              }
              return (
                <td key={index} data-th={col.header}>
                  {col.render
                    ? col.render(item[col.accessor], item)
                    : item[col.accessor]}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};

export default TablaBody;
