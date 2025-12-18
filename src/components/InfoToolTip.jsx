import { useState } from 'react';

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="info-tooltip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      ⓘ{open && <span className="info-tooltip-content">{text}</span>}
    </span>
  );
}
