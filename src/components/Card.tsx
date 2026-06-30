import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <section className={`surface-card ${className}`.trim()}>{children}</section>;
}
