import React from "react";

type AlertType = "success" | "warning" | "error" | "info";

interface AlertProps {
  type?: AlertType;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type = "info", children, className = "" }: AlertProps) {
  const styles: Record<AlertType, string> = {
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800"
  };

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm font-medium ${styles[type]} ${className}`.trim()}>
      {children}
    </div>
  );
}
