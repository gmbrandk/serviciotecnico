import React from 'react';
import { TablaAcciones } from '@components/shared/Tabla';

const TablaBody = ({ data, columns }) => {
  return (
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          {columns.map((col, index) => (
            <td key={index} data-th={col.header}>
              {col.render ? col.render(item[col.accessor], item) : item[col.accessor]}
            </td>
          ))}
          <TablaAcciones item={item} />
        </tr>
      ))}
    </tbody>
  );
};

export default TablaBody;
