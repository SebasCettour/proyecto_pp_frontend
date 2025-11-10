# Configuración de BioPortal API para CIE-10

## ¿Qué es BioPortal?

BioPortal es una plataforma del National Center for Biomedical Ontology (NCBO) que proporciona acceso a terminologías médicas, incluyendo CIE-10 (ICD-10).

## Cómo obtener tu API Key

1. **Visita**: https://bioportal.bioontology.org/

2. **Crea una cuenta**:
   - Haz clic en "Sign up" o "Register"
   - Completa el formulario de registro
   - Confirma tu correo electrónico

3. **Obtén tu API Key**:
   - Inicia sesión en BioPortal
   - Ve a tu cuenta: https://bioportal.bioontology.org/account
   - Copia tu API Key (aparece en la sección "API Key")

4. **Configura en el proyecto**:
   - Abre el archivo `.env` en `Proyecto_PP_Backend/`
   - Reemplaza `your_api_key_here` con tu API Key:
     ```
     BIOPORTAL_API_KEY=tu_api_key_aqui
     ```

5. **Reinicia el backend**:
   ```bash
   docker-compose restart backend
   ```

## Verificación

Una vez configurada la API Key, podrás buscar diagnósticos CIE-10 en el formulario de solicitud de licencias.

## Uso gratuito

La API de BioPortal es **gratuita** para uso académico y no comercial, con límites razonables de peticiones.

## Troubleshooting

Si ves error 401 (Unauthorized):
- Verifica que la API Key esté correctamente copiada en el archivo `.env`
- Asegúrate de que no haya espacios adicionales
- Reinicia el contenedor del backend después de cambiar el `.env`

Si la búsqueda no devuelve resultados:
- Intenta con códigos CIE-10 comunes: "A15", "J00", "I10"
- Intenta con términos en inglés: "tuberculosis", "hypertension"
- La ontología usada es ICD10CM (versión clínica de Estados Unidos)
