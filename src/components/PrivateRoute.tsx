import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  role?: string; // rol permitido para la ruta
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const userRole = localStorage.getItem("role"); // guardás el rol al loguear
  const token = localStorage.getItem("token"); // guardás el token al loguear

  console.log("PrivateRoute - Token:", token);
  console.log("PrivateRoute - UserRole:", userRole);
  console.log("PrivateRoute - RequiredRole:", role);

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    console.log(`Role mismatch: ${userRole} !== ${role}, redirecting to login`);
    return <Navigate to="/" replace />; // o alguna página de "no autorizado"
  }

  console.log("Access granted, rendering children");
  return children;
};

export default PrivateRoute;
