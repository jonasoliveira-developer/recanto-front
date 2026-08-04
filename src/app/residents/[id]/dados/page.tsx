"use client";

import { useState } from "react";
import { useResidenteFicha } from "@/context/ResidenteFichaContext";
import ModalResidenteForm from "@/components/Residente/ModalResidenteForm";
import { useResidentes } from "@/hooks/useResidentes";

export default function FichaDadosPage() {
  const { residente, recarregar } = useResidenteFicha();
  const { recarregar: recarregarLista } = useResidentes();
  const [aberto, setAberto] = useState(true);

  if (!residente) return null;

  return (
    <div className="surface-card p-5">
      <h2 className="mb-4 text-lg font-bold text-[var(--rc-primary-strong)]">
        Editar dados do residente
      </h2>
      <dl className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-xs font-semibold text-[var(--rc-muted)]">Nome</dt>
          <dd className="font-medium">{residente.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[var(--rc-muted)]">E-mail</dt>
          <dd>{residente.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[var(--rc-muted)]">CPF</dt>
          <dd>{residente.cpf || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-[var(--rc-muted)]">Telefone</dt>
          <dd>{residente.phoneNumber || "—"}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setAberto(true)}
      >
        Abrir formulário de edição
      </button>
      <ModalResidenteForm
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        editando={residente}
        onSalvo={async () => {
          recarregar();
          await recarregarLista();
        }}
      />
    </div>
  );
}
