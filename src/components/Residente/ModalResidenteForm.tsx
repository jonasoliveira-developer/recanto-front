"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { atualizarResidente, criarResidente } from "@/services/recantoApi";
import type { Residente } from "@/hooks/useResidentes";
import { toast } from "react-toastify";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  editando?: Residente | null;
  onSalvo: () => void | Promise<void>;
};

function perfisParaNumeros(profiles: unknown): number[] {
  if (!Array.isArray(profiles)) return [2];
  return profiles.map((p) => {
    if (typeof p === "number") return p;
    if (p === "RESIDENT" || p === "ROLE_RESIDENT") return 2;
    if (p === "ADMIN" || p === "ROLE_ADMIN") return 0;
    if (p === "EMPLOYEE" || p === "ROLE_EMPLOYEE") return 1;
    return 2;
  });
}

function FormInterno({ aberto, aoFechar, editando = null, onSalvo }: Props) {
  const { token } = useAuth();
  const [nome, setNome] = useState(editando?.name || "");
  const [cpf, setCpf] = useState(editando?.cpf || "");
  const [email, setEmail] = useState(editando?.email || "");
  const [telefone, setTelefone] = useState(editando?.phoneNumber || "");
  const [senha, setSenha] = useState("");
  const [perfis, setPerfis] = useState<number[]>(perfisParaNumeros(editando?.profiles));
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSalvando(true);
    const dados: Record<string, unknown> = {
      name: nome,
      cpf,
      email,
      password: senha || (editando?.password ?? ""),
      profiles: perfis,
      dateCriation: new Date().toLocaleDateString("pt-BR"),
    };
    if (telefone) dados.phoneNumber = telefone;
    try {
      if (editando?.id) {
        await atualizarResidente(editando.id, dados, token);
        toast.success("Residente atualizado com sucesso!");
      } else {
        await criarResidente(dados, token);
        toast.success("Residente cadastrado com sucesso!");
      }
      await onSalvo();
      aoFechar();
    } catch (erro: unknown) {
      const msg =
        (erro as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "";
      toast.error(`Erro ao salvar residente! ${msg}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={editando ? "Editar residente" : "Cadastrar residente"}
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          className="input-base"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className="input-base"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />
        <input
          className="input-base"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-base"
          placeholder="Telefone (opcional)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <input
          className="input-base"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-4">
          {(
            [
              [0, "ADM"],
              [1, "Funcionário"],
              [2, "Residente"],
            ] as const
          ).map(([valor, rotulo]) => (
            <label key={valor} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={perfis.includes(valor)}
                onChange={(e) => {
                  if (e.target.checked) setPerfis([...perfis, valor]);
                  else setPerfis(perfis.filter((p) => p !== valor));
                }}
              />
              {rotulo}
            </label>
          ))}
        </div>
        <button type="submit" className="btn btn-primary" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}

export default function ModalResidenteForm(props: Props) {
  if (!props.aberto) return null;
  const chave = `${props.editando?.id ?? "novo"}`;
  return <FormInterno key={chave} {...props} />;
}
