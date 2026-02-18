import { Routes, Route } from "react-router-dom";
import Login from "../pages/login/Login";
import PublicarNovedades from "../pages/RRHH/PublicarNovedades";
import { RRHHPrincipal } from "../pages/RRHH/RRHH-Principal";
import GestionarLicencias from "../pages/RRHH/GestionarLicencias";
import HistorialLicencias from "../pages/RRHH/HistorialLicencias";
import Tablon from "../pages/RRHH/Tablon";
import { Empleados } from "../pages/empleados/Empleados";
import SolicitarLicencia from "../pages/empleados/SolicitarLicencia";
import TablonEmpleados from "../pages/empleados/Tablon-Empleados";
import RecibosSueldo from "../pages/empleados/Ver-Recibos";
import { Contadores } from "../pages/contadores/Contadores";
import Liquidacion from "../pages/contadores/Liquidacion";
import Historial from "../pages/contadores/Historial";
import Historiales from "../pages/contadores/Historiales";
import HistorialSalarios from "../pages/contadores/HistorialSalarios";
import { SuperAdminView } from "../pages/superadmin/superAdmin";
import AltaNuevo from "../pages/superadmin/alta-nuevo";
import PrivateRoute from "../components/PrivateRoute";
import GestionUsuarios from "../pages/superadmin/gestion-usuarios";
import EditarUsuario from "../pages/superadmin/editar-usuario";
import EliminarUsuario from "../pages/superadmin/eliminar-usuario";
import MisLicencias from "../pages/empleados/MisLicencias";
import ActualizarSalario from "../pages/contadores/ActualizarSalario";

export function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/" element={<Login />} />

      {/* Rutas RRHH */}
      <Route
        path="/novedades"
        element={
          <PrivateRoute role="rrhh">
            <PublicarNovedades />
          </PrivateRoute>
        }
      />
      {/* Rutas RRHH */}
      <Route
        path="/rrhh-principal"
        element={
          <PrivateRoute role="rrhh">
            <RRHHPrincipal />
          </PrivateRoute>
        }
      />
      <Route
        path="/licencias"
        element={
          <PrivateRoute role="rrhh">
            <GestionarLicencias />
          </PrivateRoute>
        }
      />
      <Route
        path="/historial-licencias"
        element={
          <PrivateRoute role="rrhh">
            <HistorialLicencias />
          </PrivateRoute>
        }
      />
      <Route
        path="/tablon"
        element={
          <PrivateRoute role="rrhh">
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
        path="/mis-licencias"
        element={
          <PrivateRoute role="empleado">
            <MisLicencias />
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
      <Route
        path="/historial"
        element={
          <PrivateRoute role="contador">
            <Historial />
          </PrivateRoute>
        }
      />
      <Route
        path="/historiales"
        element={
          <PrivateRoute role="contador">
            <Historiales />
          </PrivateRoute>
        }
      />
      <Route
        path="/historial-salarios"
        element={
          <PrivateRoute role="contador">
            <HistorialSalarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/actualizar"
        element={
          <PrivateRoute role="contador">
            <ActualizarSalario />
          </PrivateRoute>
        }
      />

      {/* Ruta SuperAdmin */}
      <Route
        path="/superAdmin"
        element={
          <PrivateRoute role="superadmin">
            <SuperAdminView />
          </PrivateRoute>
        }
      />

      {/* Ruta Alta Gestion Usuario */}

      <Route
        path="/gestion-usuarios"
        element={
          <PrivateRoute role="superadmin">
            <GestionUsuarios />
          </PrivateRoute>
        }
      />

      {/* Ruta Alta Nuevo Usuario */}
      <Route
        path="/crear-nuevo"
        element={
          <PrivateRoute role="superadmin">
            <AltaNuevo />
          </PrivateRoute>
        }
      />
      <Route
        path="/editar-usuario"
        element={
          <PrivateRoute role="superadmin">
            <EditarUsuario />
          </PrivateRoute>
        }
      />
      <Route
        path="/eliminar-usuario"
        element={
          <PrivateRoute role="superadmin">
            <EliminarUsuario />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
