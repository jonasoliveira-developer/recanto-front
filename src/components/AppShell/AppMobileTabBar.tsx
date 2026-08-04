"use client";

import { useState } from "react";
import BottomTabBar from "./BottomTabBar";
import MenuMaisDrawer from "./MenuMaisDrawer";
import { montarItensMenuMais, montarTabsPrimarias } from "@/lib/navegacaoTabBar";
import { useAuth } from "@/context/AuthContext";

export default function AppMobileTabBar() {
  const [maisAberto, setMaisAberto] = useState(false);
  const { logout } = useAuth();
  const tabs = montarTabsPrimarias();
  const linksMais = montarItensMenuMais();

  return (
    <>
      <BottomTabBar
        tabs={tabs}
        onAbrirMais={() => setMaisAberto((v) => !v)}
        maisAberto={maisAberto}
      />
      <MenuMaisDrawer
        links={linksMais}
        aberto={maisAberto}
        onFechar={() => setMaisAberto(false)}
        onSair={logout}
      />
    </>
  );
}
