"use client";

import { use } from "react";
import { ResidenteFichaProvider } from "@/context/ResidenteFichaContext";
import FichaResidenteShell from "@/components/Residente/FichaResidenteShell";

export default function ResidenteFichaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ResidenteFichaProvider id={id}>
      <FichaResidenteShell>{children}</FichaResidenteShell>
    </ResidenteFichaProvider>
  );
}
