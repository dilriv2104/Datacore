# Backend DataCore

La API está construida con FastAPI y Python. Su trabajo es recibir las solicitudes del frontend, validar los datos, aplicar reglas de negocio, consultar PostgreSQL mediante SQLAlchemy y devolver respuestas JSON.

## Archivos principales

- `main.py`: crea la aplicación FastAPI y registra todos los routers.
- `database.py`: configura SQLAlchemy y abre/cierra sesiones de PostgreSQL.
- `auth.py`: hash de contraseñas, JWT, autenticación y roles.
- `crear_admin.py`: crea de forma segura el primer administrador desde la terminal.
- `models/`: representa las tablas de PostgreSQL mediante clases SQLAlchemy.
- `schemas/`: define y valida los datos de entrada y salida con Pydantic.
- `routers/`: agrupa los endpoints por módulo.

## Importante sobre los datos

El backend ya no ejecuta ningún `seed` al arrancar. No crea usuarios, productos, clientes o proveedores de demostración automáticamente.

El primer administrador se crea con:

```powershell
python crear_admin.py
```

Luego los registros se crean desde la aplicación o desde los endpoints.

## Seguridad

Las contraseñas se almacenan como `sal$hash` usando PBKDF2-HMAC-SHA256. El login entrega un JWT. Las rutas protegidas reciben el token como:

```text
Authorization: Bearer <token>
```

`usuario_actual` comprueba que el token sea válido y que el usuario siga activo. `requiere_rol(...)` comprueba los permisos.

## Dashboard

`GET /reportes/dashboard` es el dashboard administrativo. Está en `routers/reportes.py` y consulta PostgreSQL mediante SQLAlchemy. Calcula valor de inventario, productos activos, stock bajo, ventas, compras, productos más vendidos e inventario por categoría.

## Ejecutar

```powershell
python -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python crear_admin.py
uvicorn main:app --reload
```

La documentación interactiva queda en `http://localhost:8000/docs`.
