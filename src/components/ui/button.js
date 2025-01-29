import React from "react";

export function Button({ onClick, children, variant = "primary" }) {
  return (
    <button
      onClick={onClick}
      className={`btn ${variant === "destructive" ? "btn-danger" : "btn-primary"}`}
    >
      {children}
    </button>
  );
}
