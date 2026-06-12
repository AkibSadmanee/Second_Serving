import { useState } from "react";

export default function MultiSelect({ label, options, selected, setSelected }) {
  const [open, setOpen] = useState(false);

  const toggle = (option) => {
    setSelected(
      selected.includes(option)
        ? selected.filter((i) => i !== option)
        : [...selected, option]
    );
  };

  return (
    <div className="multi-select">
      {label && <label>{label}</label>}
      <div className="multi-select-box" onClick={() => setOpen(!open)}>
        {selected.length === 0 ? (
          <span className="placeholder">Select options…</span>
        ) : (
          <div className="selected-tags">
            {selected.map((item) => (
              <span key={item} className="selected-tag">{item}</span>
            ))}
          </div>
        )}
      </div>
      {open && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <label key={option} className="dropdown-option">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
