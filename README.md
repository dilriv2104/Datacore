# DataCore

DataCore es un sistema de gestión logística de inventarios para microempresas. Permite administrar productos, categorías, clientes, proveedores, usuarios, compras y ventas, controlar el stock y consultar un resumen del negocio.

## 1. Arquitectura

```text
React + TypeScript
       |
       | HTTP / JSON
       v
FastAPI + Python
       |
       | SQLAlchemy
       v
PostgreSQL
       |
       +-- restricciones
       +-- claves foráneas
       +-- triggers de stock
```

El frontend no guarda los datos del negocio de forma permanente. Los consulta a la API y la API los obtiene de PostgreSQL.

## 2. Roles

- **Administrador:** administra productos, categorías, clientes, proveedores, usuarios, compras, ventas y reportes.
- **Vendedor:** consulta productos y clientes y registra ventas.
- **Cliente y proveedor:** son entidades de negocio, no usuarios internos. No tienen contraseña ni inician sesión.

La base de datos también restringe el campo `usuario.rol` a `administrador` o `vendedor`.

## 3. Datos reales, no datos quemados

La aplicación **no crea usuarios, clientes, proveedores ni productos de demostración al iniciar**. Se eliminó el `seed.py` automático para que los registros del sistema provengan de PostgreSQL y de las operaciones reales de la aplicación.

El proyecto tampoco incluye una contraseña real en `.env`. Se entrega `backend/.env.example` como plantilla.

Para crear el primer administrador se usa una utilidad de instalación:

```powershell
cd backend
python crear_admin.py
```

Después de crear el administrador, los demás usuarios se pueden registrar como vendedores desde la pantalla de registro o crearse desde el módulo **Usuarios**.

## 4. Base de datos

Crear primero la base:

```sql
CREATE DATABASE datacore;
```

Después ejecutar solamente el esquema:

```bash
psql -U postgres -d datacore -f database/01_esquema.sql
```

El archivo `database/03_consultas_ejemplo.sql` contiene consultas de prueba para ejecutar después de registrar información.

El esquema contiene:

```text
ciudad
localidad
usuario
cliente
proveedor
categoria
producto
orden_compra
 detalle_compra
venta
 detalle_venta
```

Las relaciones principales son:

```text
ciudad 1 --- N localidad
localidad 1 --- N usuario / cliente / proveedor
categoria 1 --- N producto
proveedor 1 --- N orden_compra
orden_compra 1 --- N detalle_compra
producto 1 --- N detalle_compra
cliente 1 --- N venta
usuario 1 --- N venta
venta 1 --- N detalle_venta
producto 1 --- N detalle_venta
```

## 5. Reglas de integridad

PostgreSQL valida reglas importantes:

- El rol solo puede ser `administrador` o `vendedor`.
- El stock no puede ser negativo.
- El precio debe ser mayor que cero.
- Las cantidades de compras y ventas deben ser mayores que cero.
- Las claves foráneas deben apuntar a registros existentes.
- Un producto no puede tener una fecha de caducidad anterior o igual a su fecha de entrada.
- Las ventas requieren un cliente activo y un usuario activo con rol permitido.
- Las compras requieren un proveedor activo y un administrador activo.

## 6. Triggers de stock

Hay dos procesos automáticos en PostgreSQL:

- `trg_aumentar_stock_por_compra`: después de insertar un detalle de compra, suma la cantidad al stock.
- `trg_descontar_stock_por_venta`: antes de insertar un detalle de venta, bloquea la fila del producto, verifica el stock disponible y descuenta la cantidad.

Si no existe suficiente stock, PostgreSQL genera un error y el backend hace `rollback`, por lo que la venta no queda incompleta.

## 7. Backend

Entrar a:

```bash
cd backend
```

Crear entorno virtual:

```bash
python -m venv venv
```

En PowerShell, si la activación está bloqueada:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Configurar `.env`:

```text
DATABASE_URL=postgresql+psycopg://postgres:TU_CLAVE@localhost:5432/datacore
JWT_SECRET=UNA_CLAVE_LARGA_Y_PROPIA
JWT_EXPIRE_MINUTES=60
```

Se puede copiar la plantilla:

```powershell
Copy-Item .env.example .env
```

Crear el primer administrador:

```powershell
python crear_admin.py
```

Iniciar API:

```bash
uvicorn main:app --reload
```

API:

```text
http://127.0.0.1:8000
```

Documentación y pruebas:

```text
http://127.0.0.1:8000/docs
```

## 8. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Si se desea configurar explícitamente la URL del backend, copiar:

```powershell
Copy-Item .env.example .env
```

El valor esperado es:

```text
VITE_API_URL=http://localhost:8000
```

## 9. Endpoints principales

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| GET | `/` | Público | Estado de la API |
| GET | `/health` | Público | Comprobación de salud |
| POST | `/auth/login` | Público | Iniciar sesión |
| POST | `/auth/registro` | Público | Registrar vendedor |
| GET | `/auth/me` | Sesión | Usuario actual |
| GET | `/usuarios` | Administrador | Listar usuarios |
| POST | `/usuarios` | Administrador | Crear usuario |
| PATCH | `/usuarios/{id}/estado` | Administrador | Activar/inactivar usuario |
| GET | `/clientes` | Admin/Vendedor | Listar clientes |
| POST | `/clientes` | Admin/Vendedor | Crear cliente |
| PUT | `/clientes/{id}` | Admin/Vendedor | Editar cliente |
| PATCH | `/clientes/{id}/estado` | Admin/Vendedor | Activar/inactivar cliente |
| GET | `/proveedores` | Administrador | Listar proveedores |
| POST | `/proveedores` | Administrador | Crear proveedor |
| PUT | `/proveedores/{id}` | Administrador | Editar proveedor |
| PATCH | `/proveedores/{id}/estado` | Administrador | Activar/inactivar proveedor |
| GET | `/categorias` | Sesión | Listar categorías |
| POST | `/categorias` | Administrador | Crear categoría |
| PUT | `/categorias/{id}` | Administrador | Editar categoría |
| DELETE | `/categorias/{id}` | Administrador | Inactivar categoría |
| GET | `/productos` | Sesión | Listar productos |
| GET | `/productos/inventario` | Sesión | Inventario activo ordenado por stock |
| POST | `/productos` | Administrador | Crear producto |
| PUT | `/productos/{id}` | Administrador | Editar producto |
| DELETE | `/productos/{id}` | Administrador | Inactivar producto |
| GET | `/ventas` | Admin/Vendedor | Listar ventas |
| POST | `/ventas` | Admin/Vendedor | Registrar venta |
| GET | `/ordenes-compra` | Administrador | Listar compras |
| POST | `/ordenes-compra` | Administrador | Registrar compra |
| GET | `/ubicacion/ciudades` | Sesión | Consultar ciudades |
| GET | `/ubicacion/localidades` | Sesión | Consultar localidades |
| GET | `/reportes/dashboard` | Administrador | Resumen del negocio |

## 10. Prueba rápida de endpoints

1. Abrir `/docs`.
2. Ejecutar `GET /` y `GET /health`.
3. Ejecutar `POST /auth/login` con el administrador creado.
4. Copiar el token y usar **Authorize** en Swagger.
5. Ejecutar `GET /categorias`, `GET /clientes` y `GET /productos`.
6. Crear una categoría.
7. Crear un producto usando el `id_categoria` real obtenido de la API.
8. Crear un cliente.
9. Crear un proveedor con el administrador.
10. Registrar una compra y comprobar que el stock aumentó.
11. Registrar una venta y comprobar que el stock disminuyó.
12. Intentar vender más unidades de las disponibles y comprobar que PostgreSQL rechaza la operación.
13. Ejecutar `GET /reportes/dashboard` como administrador.
14. Probar `GET /usuarios` con un vendedor para comprobar el `403`.

Los IDs no se deben inventar: primero se consultan con los endpoints `GET` y después se utilizan en los `POST`.

## 11. Dashboard

El dashboard administrativo está en:

```text
Sidebar -> Reportes
```

La vista es:

```text
frontend/src/views/Reportes.tsx
```

La información llega desde:

```text
GET /reportes/dashboard
```

El endpoint está en:

```text
backend/routers/reportes.py
```

El backend realiza los cálculos con SQLAlchemy y PostgreSQL usando `SUM`, `COUNT`, `JOIN`, `GROUP BY` y `LIMIT`. React solamente recibe el resultado y lo presenta.

## 12. Estructura del código

```text
backend/
├── main.py                 # crea FastAPI y registra routers
├── database.py             # conexión y sesiones SQLAlchemy
├── auth.py                 # hash, JWT y permisos
├── crear_admin.py          # instalación del primer administrador
├── models/                 # representación Python de las tablas
├── schemas/                # validación de entrada y salida
└── routers/                # endpoints por módulo

frontend/src/
├── main.tsx                # entrada de React
├── App.tsx                 # estado y navegación principal
├── services/api.ts         # cliente HTTP y Bearer token
├── types/index.ts          # tipos TypeScript
├── components/             # componentes reutilizables
└── views/                  # pantallas

database/
├── 01_esquema.sql         # tablas, restricciones y triggers
└── 03_consultas_ejemplo.sql # consultas SQL de comprobación
```

## 13. Explicación para sustentación

El recorrido general es:

```text
Usuario
  ↓
React
  ↓
api.ts / HTTP / JSON
  ↓
FastAPI
  ↓
Pydantic + autenticación
  ↓
Router
  ↓
SQLAlchemy
  ↓
PostgreSQL
  ↓
Respuesta JSON
  ↓
React actualiza la pantalla
```

Para una venta:

```text
Ventas.tsx
  ↓
POST /ventas
  ↓
VentaCrear valida datos
  ↓
ventas.py identifica al vendedor por el JWT
  ↓
comprueba cliente y productos
  ↓
crea venta y detalles
  ↓
PostgreSQL ejecuta trigger de stock
  ↓
commit / rollback
  ↓
respuesta JSON
```

Para una compra ocurre el mismo recorrido, pero el trigger aumenta el stock.

Para el dashboard:

```text
Reportes.tsx
  ↓
GET /reportes/dashboard
  ↓
reportes.py
  ↓
SQLAlchemy
  ↓
PostgreSQL: SUM + COUNT + JOIN + GROUP BY
  ↓
DashboardRespuesta
  ↓
Reportes.tsx
```

Para la explicación completa de archivo por archivo, incluyendo cómo probar cada endpoint, consultar `SUSTENTACION.md`.
