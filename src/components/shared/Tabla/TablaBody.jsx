import React from 'react';

const TablaBody = ({
  data,
  columns,
  renderAcciones,
  renderBotonAnimar,
  onAccionPersonalizada,
  rowClassNameCallback,
  rowStyles = {}, // se inyecta desde el padre
}) => {
  return (
    <tbody>
      {data.map((item) => {
        const rowClassKey = rowClassNameCallback?.(item) || '';
        const rowClass = rowStyles[rowClassKey] || '';
        return (
          <tr key={item.id} className={rowClass}>
            {columns.map((col, index) => (
              <td key={index} data-th={col.header}>
                {col.render ? col.render(item[col.accessor], item) : item[col.accessor]}
              </td>
            ))}
            {(renderAcciones || renderBotonAnimar) && (
              <td>
                {renderBotonAnimar && renderBotonAnimar(item)}
                {renderAcciones && renderAcciones(item)}
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
};

export default TablaBody;
