# SUSTENTACIÓN COMPLETA DE DATACORE

Este documento está pensado para explicar DataCore sin tener que memorizar cada línea de memoria. La clave es saber qué responsabilidad tiene cada archivo y cómo viaja una operación desde React hasta PostgreSQL.

---

# 1. ¿QUÉ ES DATACORE?

DataCore es un sistema de gestión logística de inventarios para microempresas. Permite administrar productos, categorías, clientes, proveedores, usuarios, compras y ventas, controlar entradas y salidas de stock y consultar información del negocio mediante reportes.

La arquitectura es:

```text
React + TypeScript
       ↓ HTTP/JSON
FastAPI + Python
       ↓ SQLAlchemy
PostgreSQL
```

Una frase para memorizar:

> "React muestra la información y recoge los datos del usuario; FastAPI recibe y procesa las solicitudes; SQLAlchemy comunica Python con PostgreSQL; y PostgreSQL guarda y protege la información mediante tablas, restricciones y triggers."

---

# 2. BASE DE DATOS: `database/01_esquema.sql`

## 2.1 Tablas

### `ciudad`

Guarda ciudades. `id_ciudad` es la clave primaria y PostgreSQL la genera automáticamente con `IDENTITY`.

### `localidad`

Guarda localidades y tiene `id_ciudad` como clave foránea. Una ciudad puede tener muchas localidades.

### `usuario`

Guarda los usuarios que pueden entrar al sistema. Los únicos roles internos son `administrador` y `vendedor`.

La restricción:

```sql
CHECK (rol IN ('administrador', 'vendedor'))
```

impide otros roles.

### `cliente`

Es una persona o negocio al que se le realiza una venta. No es un usuario interno y no tiene contraseña.

### `proveedor`

Es quien suministra mercancía. Tampoco es un usuario de login.

### `categoria`

Agrupa productos.

### `producto`

Es el catálogo. Guarda nombre, descripción, stock, precio, unidad de medida, fechas, estado y categoría.

### `venta`

Cabecera de una venta: fecha, vendedor y cliente.

### `detalle_venta`

Productos y cantidades que pertenecen a una venta.

### `orden_compra`

Cabecera de una compra: fecha, proveedor, administrador y estado.

### `detalle_compra`

Productos, cantidades y precio de compra de una orden.

---

# 3. CLAVES PRIMARIAS Y FORÁNEAS

Una clave primaria identifica una fila de forma única.

Ejemplo:

```sql
id_producto INTEGER ... PRIMARY KEY
```

Una clave foránea relaciona una tabla con otra:

```sql
FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
```

Esto significa que un producto apunta a una categoría existente.

Frase para la sustentación:

> "Las claves primarias identifican los registros y las claves foráneas mantienen las relaciones entre tablas y protegen la integridad referencial."

---

# 4. RESTRICCIONES IMPORTANTES

`NOT NULL`: el campo es obligatorio.

`UNIQUE`: no permite repetir un valor donde se exige unicidad.

`CHECK`: valida una condición.

Ejemplo:

```sql
CHECK (stock >= 0)
```

impide stock negativo.

```sql
CHECK (precio_unitario > 0)
```

impide precios cero o negativos.

---

# 5. TRIGGERS DE STOCK

Un trigger es una acción automática de PostgreSQL que se ejecuta cuando ocurre un evento.

## Compra

Al insertar un detalle de compra:

```text
stock anterior + cantidad comprada = stock nuevo
```

Ejemplo: 10 + 5 = 15.

## Venta

Antes de insertar un detalle de venta PostgreSQL consulta el stock y bloquea la fila con `FOR UPDATE`.

Si hay 3 y se solicitan 5, genera error.

Si hay 10 y se solicitan 3:

```text
10 - 3 = 7
```

Esto es importante porque el control del inventario no depende solamente del navegador.

---

# 6. ¿POR QUÉ HAY `venta` Y `detalle_venta`?

Porque una venta puede tener varios productos.

```text
venta #10
 ├── arroz x2
 ├── jabón x1
 └── mouse x3
```

La cabecera guarda información general y el detalle guarda cada producto.

Lo mismo ocurre con compras.

---

# 7. `database/03_consultas_ejemplo.sql`

Contiene consultas SQL para comprobar que las relaciones funcionan.

### Consulta de producto y categoría

Usa `INNER JOIN` para unir producto con categoría.

### Consulta de ventas

Une:

```text
venta
usuario
cliente
detalle_venta
producto
```

Así se puede saber quién vendió, a quién, qué producto y qué cantidad.

### Consulta de compras

Une:

```text
orden_compra
usuario
proveedor
detalle_compra
producto
```

### Stock bajo

Filtra productos activos con stock menor o igual al umbral establecido.

### Valor de inventario

Usa:

```sql
SUM(stock * precio_unitario)
```

---

# 8. `backend/database.py`

Este archivo configura la conexión con PostgreSQL.

`load_dotenv()` carga variables desde `.env`.

`DATABASE_URL` contiene la dirección de PostgreSQL.

`create_engine(...)` crea el motor de SQLAlchemy.

`SessionLocal` crea sesiones de trabajo.

`Base = declarative_base()` es la clase base de los modelos.

`get_db()` crea una sesión por petición y la cierra en `finally`.

Frase:

> "La sesión se abre para atender la solicitud y se cierra al finalizar para no dejar conexiones abiertas."

---

# 9. `backend/models/`

Los modelos son clases Python que representan tablas.

Ejemplo:

```python
class Producto(Base):
    __tablename__ = "producto"
```

SQLAlchemy entiende que `Producto` representa la tabla `producto`.

Los `Column` representan las columnas.

`ForeignKey` representa una relación.

---

# 10. `backend/schemas/`

Los schemas son modelos de Pydantic. No son las tablas.

Su función principal es definir qué datos acepta y devuelve la API.

Ejemplo:

```python
stock: int = Field(default=0, ge=0)
```

Significa que stock debe ser entero y no puede ser menor que cero.

Diferencia:

```text
Model  → estructura de PostgreSQL
Schema → estructura de entrada/salida de la API
```

---

# 11. `backend/auth.py`

## `hash_password`

No guarda la contraseña directamente.

Genera una sal aleatoria y usa PBKDF2-HMAC-SHA256 para obtener el hash.

Se guarda:

```text
sal$hash
```

## `verificar_password`

Toma la contraseña que escribe el usuario, vuelve a calcular el hash con la sal almacenada y compara ambos valores.

## `crear_token`

Crea un JWT con:

```text
sub → id del usuario
rol → administrador/vendedor
exp → fecha de vencimiento
```

## `usuario_actual`

Lee el Bearer token, verifica el JWT, busca el usuario y comprueba que esté activo.

## `requiere_rol`

Es una dependencia reutilizable para restringir endpoints.

Ejemplo:

```python
Depends(requiere_rol("administrador"))
```

---

# 12. 401 Y 403

`401` significa que no hay una autenticación válida: falta token, es inválido o está vencido.

`403` significa que el usuario sí está autenticado pero su rol no tiene permiso.

Ejemplo: un vendedor intentando `GET /usuarios` debe recibir 403.

---

# 13. `backend/main.py`

Crea:

```python
app = FastAPI(...)
```

Agrega CORS para permitir que el frontend local se comunique con la API.

Define `/` y `/health`.

Después registra los routers con `include_router`.

Por ejemplo:

```python
app.include_router(ventas.router, prefix="/ventas")
```

Eso hace que una ruta `@router.get("")` dentro de ventas termine siendo `GET /ventas`.

No existe un `seed` de datos en el arranque. Esto es intencional para evitar datos de demostración quemados.

---

# 14. `backend/routers/`

Cada router agrupa un módulo.

## `auth.py`

Login, registro y usuario actual.

## `usuarios.py`

Listar, crear y activar/inactivar usuarios.

## `clientes.py`

Listar, crear, editar y activar/inactivar clientes.

## `proveedores.py`

Listar, crear, editar y activar/inactivar proveedores.

## `catalogo.py`

Categorías y productos.

## `ventas.py`

Listar y registrar ventas.

## `compras.py`

Listar y registrar compras.

## `ubicacion.py`

Ciudades y localidades.

## `reportes.py`

Dashboard administrativo.

---

# 15. ¿QUÉ HACE UN ENDPOINT?

Un endpoint es una función accesible por HTTP.

```text
GET    → consultar
POST   → crear
PUT    → actualizar
PATCH  → modificar parcialmente
DELETE → inactivar/eliminar según la operación
```

---

# 16. CLIENTES Y PROVEEDORES

Se agregaron operaciones reales para no depender de registros de prueba.

Cliente:

```text
GET   /clientes
POST  /clientes
PUT   /clientes/{id}
PATCH /clientes/{id}/estado
```

Proveedor:

```text
GET   /proveedores
POST  /proveedores
PUT   /proveedores/{id}
PATCH /proveedores/{id}/estado
```

Así el administrador o vendedor puede crear la información necesaria para una venta y el administrador puede crear los proveedores necesarios para compras.

---

# 17. COMPRAS

`POST /ordenes-compra` recibe proveedor y detalles.

El backend comprueba:

1. proveedor existente y activo;
2. que haya por lo menos un detalle;
3. productos existentes y activos;
4. cantidades y precios válidos mediante Pydantic.

Crea la cabecera y luego los detalles.

Al insertar cada detalle, el trigger aumenta el stock.

`commit()` confirma.

Si ocurre una excepción, `rollback()` revierte la transacción.

---

# 18. VENTAS

`POST /ventas` recibe cliente, descuento y detalles.

El vendedor se obtiene desde el JWT, no desde un ID enviado por el navegador. Esto evita que el usuario pueda registrar una venta haciéndose pasar por otro vendedor.

El backend comprueba cliente y productos.

El precio unitario se toma desde PostgreSQL. El navegador ya no puede cambiar el precio real enviando otro valor.

Si hay descuento, el backend calcula:

```text
precio aplicado = precio producto × (1 - descuento / 100)
```

El detalle guarda el precio aplicado.

Después el trigger controla el stock.

---

# 19. IVA

La interfaz calcula el IVA del 19 % como regla comercial solicitada para DataCore:

```text
IVA = subtotal con descuento × 0.19
Total = subtotal con descuento + IVA
```

El detalle de la venta almacena el precio unitario aplicado y las cantidades. El dashboard de ventas usa esos valores almacenados para calcular el valor vendido.

---

# 20. DASHBOARD

Esta es una pregunta clave.

Ubicación:

```text
Frontend:
frontend/src/views/Reportes.tsx

Backend:
backend/routers/reportes.py

Endpoint:
GET /reportes/dashboard
```

Acceso:

```text
Administrador
```

El endpoint calcula:

- valor del inventario;
- productos activos;
- productos con stock bajo;
- total de ventas;
- valor vendido;
- total de compras;
- valor comprado;
- top 5 productos vendidos;
- inventario por categoría.

Utiliza operaciones como:

`SUM`: suma valores.

`COUNT`: cuenta registros.

`JOIN`: combina tablas.

`GROUP BY`: agrupa resultados.

`ORDER BY`: ordena resultados.

`LIMIT 5`: limita el top a cinco productos.

`COALESCE(..., 0)`: evita obtener `NULL` cuando no existen registros para sumar.

El frontend no inventa estos datos: recibe el resultado del endpoint y lo muestra.

---

# 21. FRONTEND: `main.tsx`

Es el punto de entrada de React.

`createRoot` monta `<App />` dentro del elemento `root` del HTML.

---

# 22. `App.tsx`

Es el componente principal.

Mantiene estados como:

```text
token
usuario
seccion
productos
categorias
clientes
proveedores
ventas
compras
usuarios
dashboard
```

`useState` guarda valores que cambian.

`useEffect` ejecuta la carga de datos cuando cambia la sesión.

`Promise.all` permite solicitar varios recursos y esperar sus resultados.

`cargarDatos()` consulta primero información general. Si el usuario es administrador también consulta usuarios, proveedores, compras y dashboard.

---

# 23. `services/api.ts`

Es el cliente HTTP central.

Todas las vistas llaman a:

```text
api(...)
```

La función construye la URL, agrega `Content-Type` y, si existe, agrega:

```text
Authorization: Bearer TOKEN
```

Después interpreta el JSON y si la respuesta HTTP no es correcta lanza un error.

Esto evita repetir el mismo código de `fetch` en cada vista.

---

# 24. `localStorage`

El frontend guarda el JWT en:

```text
datacore_token
```

Al recargar la página lo puede recuperar.

Al cerrar sesión lo elimina.

---

# 25. VISTAS

## `Login.tsx`

Envía `POST /auth/login`.

## `Registro.tsx`

Envía `POST /auth/registro` y crea un vendedor.

## `Inicio.tsx`

Muestra un resumen rápido y accesos directos.

## `Inventario.tsx`

Permite crear, editar, consultar e inactivar productos.

## `Categorias.tsx`

Permite administrar categorías.

## `Clientes.tsx`

Permite registrar y administrar clientes.

## `Proveedores.tsx`

Permite administrar proveedores para compras.

## `Ventas.tsx`

Permite seleccionar cliente, agregar productos, calcular subtotal, descuento, IVA y total y registrar la venta.

## `Compras.tsx`

Permite seleccionar proveedor, productos, cantidades y precios de compra.

## `Usuarios.tsx`

Permite al administrador crear usuarios y activar/inactivar cuentas.

## `Reportes.tsx`

Muestra el dashboard que llega desde `/reportes/dashboard`.

---

# 26. COMPONENTES

`Sidebar.tsx`: menú lateral y opciones según rol.

`Modal.tsx`: ventana reutilizable.

`Toast.tsx`: mensaje de error o información.

Esto es reutilización de componentes de React.

---

# 27. TYPESCRIPT

`types/index.ts` define las estructuras que utiliza el frontend.

Ejemplo:

```typescript
type Rol = 'administrador' | 'vendedor'
```

Esto evita utilizar roles arbitrarios.

Las interfaces `Producto`, `Cliente`, `Proveedor`, `Venta`, `OrdenCompra` y `Dashboard` describen los datos que llegan de la API.

---

# 28. CONCEPTOS DE REACT QUE PUEDEN PREGUNTAR

`map()` recorre una lista para generar elementos.

`filter()` selecciona elementos que cumplen una condición.

`reduce()` acumula un resultado, por ejemplo un subtotal.

`useMemo()` memoriza un cálculo derivado mientras no cambien sus dependencias.

`props` son datos o funciones que un componente recibe desde su padre.

---

# 29. FLUJO DEL LOGIN

```text
Usuario escribe correo y contraseña
          ↓
Login.tsx
          ↓
POST /auth/login
          ↓
FastAPI
          ↓
busca usuario
          ↓
verifica hash
          ↓
crea JWT
          ↓
React recibe token
          ↓
localStorage
          ↓
requests protegidas con Bearer
```

---

# 30. FLUJO DE UNA VENTA

```text
Ventas.tsx
   ↓
selección de cliente/productos/cantidad
   ↓
POST /ventas
   ↓
Pydantic valida
   ↓
JWT identifica vendedor
   ↓
FastAPI comprueba cliente/productos
   ↓
SQLAlchemy crea venta y detalles
   ↓
PostgreSQL trigger verifica stock
   ↓
si hay stock → descuenta
si no hay stock → error
   ↓
commit o rollback
   ↓
JSON
   ↓
React actualiza pantalla
```

---

# 31. FLUJO DE UNA COMPRA

```text
Compras.tsx
   ↓
POST /ordenes-compra
   ↓
validación
   ↓
crea orden
   ↓
crea detalles
   ↓
trigger de compra
   ↓
stock + cantidad
   ↓
commit
```

---

# 32. FLUJO DEL DASHBOARD

```text
Sidebar → Reportes
        ↓
GET /reportes/dashboard
        ↓
requiere administrador
        ↓
SQLAlchemy
        ↓
PostgreSQL
        ↓
SUM / COUNT / JOIN / GROUP BY
        ↓
DashboardRespuesta
        ↓
Reportes.tsx
```

---

# 33. CÓMO PROBAR LA API EN SWAGGER

Arrancar:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

Abrir:

```text
http://127.0.0.1:8000/docs
```

## Prueba 1: API

`GET /`

Debe responder con estado `ok`.

## Prueba 2: salud

`GET /health`

Debe responder `healthy`.

## Prueba 3: login

`POST /auth/login`

Usar las credenciales del administrador que se creó con `crear_admin.py`.

## Prueba 4: autorización

Copiar el JWT de la respuesta y pulsar **Authorize**.

## Prueba 5: categorías

`GET /categorias`.

Luego crear una con `POST /categorias`.

Ejemplo:

```json
{
  "nombre_categoria": "Abarrotes",
  "descripcion": "Productos de consumo",
  "estado": true
}
```

## Prueba 6: producto

Primero consultar categorías y usar un `id_categoria` real.

```json
{
  "nombre": "Producto de prueba",
  "descripcion": "Producto creado durante la prueba",
  "stock": 10,
  "precio_unitario": 5000,
  "unidad_medida": "Unidad",
  "fecha_entrada": "2026-09-18",
  "fecha_caducidad": null,
  "estado": true,
  "id_categoria": 1
}
```

El `1` es solamente un ejemplo. Debe sustituirse por un ID que exista.

## Prueba 7: validación de stock

Intentar crear producto con:

```json
"stock": -1
```

Pydantic debe rechazarlo.

## Prueba 8: cliente

`POST /clientes`:

```json
{
  "nombre": "Cliente de prueba",
  "correo": "cliente@ejemplo.com",
  "telefono": "3000000000",
  "direccion": "Bogotá",
  "id_localidad": null,
  "estado": true
}
```

## Prueba 9: proveedor

Con administrador:

`POST /proveedores`:

```json
{
  "nombre": "Proveedor de prueba",
  "correo": "proveedor@ejemplo.com",
  "telefono": "3000000001",
  "direccion": "Bogotá",
  "id_localidad": null,
  "estado": true
}
```

## Prueba 10: compra

Primero consultar `/proveedores` y `/productos` para obtener IDs reales.

Ejemplo:

```json
{
  "id_proveedor": 1,
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 5,
      "precio_compra": 3000
    }
  ]
}
```

Consultar después `/productos` y comprobar que el stock aumentó en 5.

## Prueba 11: venta

Consultar `/clientes` y `/productos` y usar IDs reales.

```json
{
  "id_cliente": 1,
  "descuento_porcentaje": 0,
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 2
    }
  ]
}
```

Consultar nuevamente `/productos`: el stock debe disminuir en 2.

## Prueba 12: stock insuficiente

Si el producto tiene 3 unidades, intentar vender 10.

El trigger debe generar un error de stock insuficiente y la venta no debe quedar guardada.

## Prueba 13: permisos

Crear o registrar un vendedor, autorizar su token y ejecutar:

```text
GET /usuarios
```

Debe recibir `403` porque ese endpoint requiere administrador.

## Prueba 14: dashboard

Autorizar administrador y ejecutar:

```text
GET /reportes/dashboard
```

Debe devolver el resumen calculado con datos de la base.

---

# 34. RESPUESTAS CORTAS PARA PREGUNTAS TÉCNICAS

### ¿Por qué React?

> "Porque permite construir la interfaz por componentes reutilizables y manejar el estado de la aplicación de forma organizada."

### ¿Por qué TypeScript?

> "Porque agrega tipos a JavaScript y permite detectar errores relacionados con la estructura de los datos antes de ejecutar."

### ¿Por qué FastAPI?

> "Porque facilita la construcción de APIs, integra validación con Pydantic y genera documentación Swagger automáticamente."

### ¿Por qué PostgreSQL?

> "Porque es un gestor relacional robusto y permite claves foráneas, restricciones, transacciones y triggers."

### ¿Por qué SQLAlchemy?

> "Porque permite trabajar con PostgreSQL desde Python mediante modelos y consultas y mantiene separado el acceso a datos de las vistas."

### ¿Por qué JWT?

> "Para identificar la sesión del usuario mediante un token que se envía en las solicitudes protegidas."

### ¿Qué es un ORM?

> "Es una herramienta que relaciona objetos del lenguaje de programación con tablas de la base de datos. En este caso SQLAlchemy."

### ¿Qué es Pydantic?

> "Es la herramienta que FastAPI utiliza para validar y estructurar los datos de entrada y salida."

### ¿Qué hace un trigger?

> "Ejecuta automáticamente una acción en PostgreSQL cuando ocurre un evento definido sobre una tabla."

### ¿Qué hace `commit()`?

> "Confirma los cambios de la transacción en la base de datos."

### ¿Qué hace `rollback()`?

> "Revierte los cambios pendientes cuando ocurre un error."

### ¿Qué hace `flush()`?

> "Envía los cambios pendientes a la base dentro de la transacción para poder obtener IDs generados antes del commit."

### ¿Qué hace `Depends()`?

> "Permite que FastAPI inyecte dependencias como la sesión de base de datos o el usuario autenticado."

### ¿Por qué `JOIN`?

> "Porque la información está normalizada en varias tablas y necesitamos unirlas para consultar datos relacionados."

### ¿Qué hace `GROUP BY`?

> "Agrupa registros para poder calcular valores por grupo, por ejemplo inventario por categoría."

### ¿Por qué no borrar físicamente un producto?

> "Porque puede estar relacionado con operaciones históricas. Se inactiva mediante `estado` para conservar la información."

### ¿Qué pasa si un vendedor intenta administrar usuarios?

> "El frontend no le muestra esa sección y el backend también verifica el rol. Si intenta llamar directamente al endpoint recibe 403."

### ¿Dónde está el dashboard?

> "Está en Reportes del menú. La vista es `frontend/src/views/Reportes.tsx`, consume `GET /reportes/dashboard` y el endpoint está en `backend/routers/reportes.py`. Los cálculos se realizan con consultas SQLAlchemy sobre PostgreSQL."

### ¿Cómo se controla el stock?

> "Las compras aumentan el stock mediante un trigger y las ventas lo disminuyen mediante otro trigger. La venta además verifica que exista stock suficiente y la transacción se revierte si no alcanza."

---

# 35. LA EXPLICACIÓN GENERAL PARA MEMORIZAR

> "DataCore está dividido por capas. En el frontend usamos React y TypeScript para las interfaces y el manejo del estado. Las vistas se comunican mediante `api.ts` con una API creada en FastAPI. FastAPI organiza los endpoints por routers, valida los datos con Pydantic y controla autenticación y roles mediante JWT. SQLAlchemy representa las tablas y permite consultar PostgreSQL. En PostgreSQL tenemos claves primarias, claves foráneas, restricciones y triggers. Los triggers son especialmente importantes para el inventario porque una compra aumenta el stock y una venta lo disminuye, evitando que el stock quede negativo. Finalmente, el backend devuelve JSON y React utiliza esa información para actualizar las pantallas. El dashboard administrativo se consulta mediante `/reportes/dashboard`, donde los datos se calculan con `SUM`, `COUNT`, `JOIN` y `GROUP BY` y luego se muestran en Reportes."

---

# 36. ORDEN RECOMENDADO PARA SUSTENTAR

1. Explicar qué problema resuelve DataCore.
2. Mostrar arquitectura: React → FastAPI → SQLAlchemy → PostgreSQL.
3. Mostrar tablas y relaciones.
4. Explicar restricciones y triggers.
5. Explicar login, hash y JWT.
6. Mostrar `/docs` y probar login.
7. Probar creación de datos reales.
8. Hacer una compra y demostrar aumento de stock.
9. Hacer una venta y demostrar disminución de stock.
10. Intentar vender más stock y mostrar el error.
11. Entrar como vendedor y mostrar el `403` de usuarios.
12. Entrar como administrador y mostrar Reportes / dashboard.

Si se bloquea una pregunta sobre un archivo, ubicarlo primero por capa:

```text
Base de datos → database/
Conexión → database.py
Seguridad → auth.py
Tablas en Python → models/
Validación → schemas/
Endpoints → routers/
Entrada React → main.tsx
Estado/navegación → App.tsx
Pantallas → views/
HTTP → services/api.ts
Tipos → types/
```
