// Script de prueba para testear el backend
const testUser = {
  username: "Juan Test",
  email: "juan.test@example.com", 
  password: "contraseña_de_mas_de_10_caracteres", // Más de 10 caracteres
  roleId: 4,
  area: "IT",
  cargo: "Desarrollador",
  domicilio: "Calle Test 123, Ciudad, Provincia",
  estadoCivil: "Soltero/a",
  fechaContrato: "2024-01-15",
  fechaNacimiento: "1990-05-20",
  telefono: "1123456789",
  tipoDocumento: "DNI",
  numeroDocumento: "12345678"
};

fetch('http://localhost:4000/api/usuario/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testUser)
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Response:', text);
  try {
    const json = JSON.parse(text);
    console.log('JSON:', json);
  } catch (e) {
    console.log('No JSON response');
  }
})
.catch(error => {
  console.error('Error:', error);
});