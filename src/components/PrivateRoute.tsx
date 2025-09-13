import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  role?: string; // rol permitido para la ruta
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const userRole = localStorage.getItem("role"); // guardás el rol al loguear
  const token = localStorage.getItem("token"); // guardás el token al loguear

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />; // o alguna página de "no autorizado"
  }

  return children;
};

export default PrivateRoute;
