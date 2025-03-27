import React from "react";

/**
 * Simple button component that renders a clickable button with underline decoration
 * @param {string} name - The text to display on the button
 * @param {() => void} onClick - Click handler function
 */
export function Button({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      className="m-0 h-8 justify-center truncate p-0 font-lora underline decoration-header2 hover:decoration-header"
      onClick={onClick}
    >
      {name}
    </button>
  );
}