import { Routes, Route } from "react-router-dom";
import Login from "../pages/login/Login";
import PublicarNovedades from "../pages/RRHH/PublicarNovedades";
import { RRHHPrincipal } from "../pages/RRHH/RRHH-Principal";
import GestionarLicencias from "../pages/RRHH/GestionarLicencias";
import Tablon from "../pages/RRHH/Tablon";
import { Empleados } from "../pages/empleados/Empleados";
import SolicitarLicencia from "../pages/empleados/SolicitarLicencia";
import TablonEmpleados from "../pages/empleados/Tablon-Empleados";
import RecibosSueldo from "../pages/empleados/Ver-Recibos";
import { Contadores } from "../pages/contadores/Contadores";
import Liquidacion from "../pages/contadores/Liquidacion";
import { SuperAdminView } from "../pages/superadmin/superAdmin";
import PrivateRoute from "../components/PrivateRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Rutas RRHH */}
      <Route
        path="/novedades"
        element={
          <PrivateRoute role="RRHH">
            <PublicarNovedades />
          </PrivateRoute>
        }
      />
      <Route
        path="/rrhh-principal"
        element={
          <PrivateRoute role="RRHH">
            <RRHHPrincipal />
          </PrivateRoute>
        }
      />
      <Route
        path="/licencias"
        element={
          <PrivateRoute role="RRHH">
            <GestionarLicencias />
          </PrivateRoute>
        }
      />
      <Route
        path="/tablon"
        element={
          <PrivateRoute role="RRHH">
            <Tablon />
          </PrivateRoute>
        }
      />

      {/* Rutas Empleados */}
      <Route
        path="/empleados"
        element={
          <PrivateRoute role="empleado">
            <Empleados />
          </PrivateRoute>
        }
      />
      <Route
        path="/solicitar-licencia"
        element={
          <PrivateRoute role="empleado">
            <SolicitarLicencia />
          </PrivateRoute>
        }
      />
      <Route
        path="/ver-novedades"
        element={
          <PrivateRoute role="empleado">
            <TablonEmpleados />
          </PrivateRoute>
        }
      />
      <Route
        path="/mis-recibos"
        element={
          <PrivateRoute role="empleado">
            <RecibosSueldo />
          </PrivateRoute>
        }
      />

      {/* Rutas Contadores */}
      <Route
        path="/contadores"
        element={
          <PrivateRoute role="contador">
            <Contadores />
          </PrivateRoute>
        }
      />
      <Route
        path="/liquidacion"
        element={
          <PrivateRoute role="contador">
            <Liquidacion />
          </PrivateRoute>
        }
      />

      {/* Ruta SuperAdmin */}
      <Route
        path="/superAdmin"
        element={
          <PrivateRoute role="superAdmin">
            <SuperAdminView />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
