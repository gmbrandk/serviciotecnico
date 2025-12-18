import { useState } from 'react';

export default function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accordion">
      <button
        type="button"
        className="accordion-header"
        onClick={() => setOpen(!open)}
      >
        {title}
        <span className="accordion-icon">{open ? '▾' : '▸'}</span>
      </button>

      {open && <div className="accordion-content">{children}</div>}
    </div>
  );
}
