const bcrypt = require('bcryptjs');

const password = 'supersecret123';
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);

console.log('🔐 Hash generado para la contraseña "supersecret123":');
console.log(hash);
console.log('\n📋 Comando SQL para insertar el superadmin:');
console.log(`
INSERT INTO User (
    Nombre_Usuario, 
    Correo_Electronico, 
    Contrasenia, 
    Id_Rol
) VALUES (
    'Superadmin',
    'superadmin@admin.com',
    '${hash}',
    1
);
`);