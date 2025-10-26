# Comandos útiles para MySQL en Docker

## Acceder a la consola de MySQL

Ejecuta el siguiente comando en tu terminal para abrir la consola de MySQL dentro del contenedor `mysql-db`:

```
docker exec -it mysql-db mysql -u root -p
```

Luego ingresa la contraseña cuando se te solicite.

## Insertar una empresa de ejemplo

Para insertar una empresa llamada "Bazar Santa Fe" con rubro "bazar", un CUIL-CUIT inventado y domicilio "San Martin 2015":

```sql
INSERT INTO Empresa (Nombre_Empresa, Rubro, CUIL_CUIT, Domicilio)
VALUES ('Bazar Santa Fe', 'bazar', '30-12345678-9', 'San Martin 2015');
```

Puedes cambiar el CUIL-CUIT si lo necesitas.
