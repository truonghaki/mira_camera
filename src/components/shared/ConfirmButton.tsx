"use client";

import type { ReactNode } from "react";

export function ConfirmButton({
  children,
  message,
  onConfirm,
  className = "",
}: {
  children: ReactNode;
  message: string;
  onConfirm: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(message)) onConfirm();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
