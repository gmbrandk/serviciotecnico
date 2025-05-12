import React from 'react';

const TablaHeader = ({ columns }) => {
  return (
    <thead>
      <tr>
        {columns.map((col, index) => (
          <th key={index}>{col.header}</th>
        ))}
      </tr>
    </thead>
  );
};

export default TablaHeader;
