import React from 'react';

const TablaBody = ({
  data,
  columns,
  renderAcciones,
  rowClassNameCallback,
  rowClassMap = {}, // se inyecta desde el padre
}) => {
  return (
    <tbody>
  {data.map((item) => {
    const classKeys = rowClassNameCallback?.(item) || [];
    const rowClass = classKeys
      .map((key) => rowClassMap[key] || key) // 👈 usa el key si no está en el mapa
      .filter(Boolean)
      .join(' ');

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
              {col.render ? col.render(item[col.accessor], item) : item[col.accessor]}
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
