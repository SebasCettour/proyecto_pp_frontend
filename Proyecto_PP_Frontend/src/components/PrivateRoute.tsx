import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  role: string | string[];
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ role, children }) => {
  const userRole = localStorage.getItem("role"); // tu lugar donde guardas el rol

  // Convertir role a array si viene como string
  const allowedRoles = Array.isArray(role) ? role : [role];

  // 🔹 SuperAdmin siempre puede acceder
  if (userRole !== "superadmin" && !allowedRoles.includes(userRole || "")) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
