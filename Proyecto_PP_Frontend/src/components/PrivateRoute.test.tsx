import { render, screen } from "@testing-library/react";
import PrivateRoute from "./PrivateRoute";

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => <div>NAVIGATE:{to}</div>,
}), { virtual: true });

describe("PrivateRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renderiza children cuando el rol está permitido", () => {
    localStorage.setItem("role", "rrhh");

    render(
      <PrivateRoute role="rrhh">
        <div>Contenido privado</div>
      </PrivateRoute>
    );

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });

  it("redirecciona a home cuando el rol no está permitido", () => {
    localStorage.setItem("role", "empleado");

    render(
      <PrivateRoute role="rrhh">
        <div>Contenido privado</div>
      </PrivateRoute>
    );

    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    expect(screen.getByText("NAVIGATE:/")).toBeInTheDocument();
  });

  it("permite acceso a superadmin aunque no esté en allowedRoles", () => {
    localStorage.setItem("role", "superadmin");

    render(
      <PrivateRoute role="rrhh">
        <div>Contenido privado</div>
      </PrivateRoute>
    );

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });

  it("redirecciona cuando no hay rol en localStorage", () => {
    render(
      <PrivateRoute role="rrhh">
        <div>Contenido privado</div>
      </PrivateRoute>
    );

    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    expect(screen.getByText("NAVIGATE:/")).toBeInTheDocument();
  });

  it("permite acceso cuando role viene como array y el usuario está incluido", () => {
    localStorage.setItem("role", "contador");

    render(
      <PrivateRoute role={["rrhh", "contador"]}>
        <div>Contenido privado</div>
      </PrivateRoute>
    );

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });

  it("redirecciona cuando role viene como array y el usuario no está incluido", () => {
    localStorage.setItem("role", "empleado");

    render(
      <PrivateRoute role={["rrhh", "contador"]}>
        <div>Contenido privado</div>
      </PrivateRoute>
    );

    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    expect(screen.getByText("NAVIGATE:/")).toBeInTheDocument();
  });
});
