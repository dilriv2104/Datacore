# Estructura del frontend de DataCore

Cada módulo funcional está separado para que sea fácil de explicar, mantener y probar.

```text
src/
├── components/          # Componentes reutilizables
├── services/             # Comunicación con la API
├── types/                # Tipos TypeScript
├── views/
│   ├── Auth/             # Login y registro
│   ├── Inicio/           # Dashboard de inicio
│   ├── Inventario/       # Interfaz + tabla de productos
│   ├── Categorias/       # Interfaz + tabla de categorías
│   ├── Clientes/         # Interfaz + tabla de clientes
│   ├── Proveedores/      # Interfaz + tabla de proveedores
│   ├── Usuarios/         # Interfaz + tabla de usuarios
│   ├── Ventas/           # Interfaz de venta + tabla de ventas
│   ├── Compras/          # Interfaz de compra + tabla de órdenes
│   └── Reportes/         # Interfaz del dashboard + tablas
└── App.tsx               # Coordina sesión, datos y navegación
```

## Regla de organización

- `Interfaz.tsx`: formulario, filtros, acciones y lógica visual del módulo.
- `Tabla.tsx`: presentación de registros en tabla o listado.
- `index.tsx`: punto de entrada del módulo para mantener los imports limpios.
- `components/`: solo componentes reutilizables entre módulos.
- `services/api.ts`: único cliente HTTP del frontend.
- `types/index.ts`: contratos de datos compartidos con la API.

El frontend no contiene consultas SQL ni datos de negocio inventados. Los datos vienen de los endpoints de FastAPI.
