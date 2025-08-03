import { Routes, Route } from "react-router-dom";
import Login from "../pages/login/Login";
import PublicarNovedades from "../pages/RRHH/PublicarNovedades";
import { RRHHPrincipal } from "../pages/RRHH/RRHH-Principal";
import GestionarLicencias from "../pages/RRHH/GestionarLicencias";
import Tablon from "../pages/RRHH/Tablon";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/novedades" element={<PublicarNovedades />} />
      <Route path="/rrhh-principal" element={<RRHHPrincipal />} />
      <Route path="/licencias" element={<GestionarLicencias />} />
      <Route path="/tablon" element={<Tablon />} />
    </Routes>
  );
}
