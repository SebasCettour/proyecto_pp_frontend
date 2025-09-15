// Configuración de la API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  CIE10_SEARCH: `${API_BASE_URL}/api/cie10/search`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  // Agregar más endpoints según sea necesario
};
