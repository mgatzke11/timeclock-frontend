import React from "react";

export function Input({ placeholder, value, onChange }) {
  return <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="p-2 border rounded" />;
}
