import React from 'react';
import TablaAcciones from './TablaAcciones'; // Si deseas usar acciones

const TablaBody = ({ data, columns, spotlightId }) => {
  return (
    <tbody>
      {data.map((item) => (
        <tr key={item.id} className={item.id === spotlightId ? 'spotlight' : ''}>
          {columns.map((col, index) => (
            <td key={index} data-th={col.header}>
              {col.render ? col.render(item[col.accessor], item) : item[col.accessor]}
            </td>
          ))}
          {<TablaAcciones item={item} />}
        </tr>
      ))}
    </tbody>
  );
};

export default TablaBody;
