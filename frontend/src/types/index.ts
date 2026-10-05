export type Rol = 'administrador' | 'vendedor';

export type ProductoFormulario = Omit<Producto, 'id_producto'>;
export type ClienteFormulario = Omit<Cliente, 'id_cliente'>;
export type ProveedorFormulario = Omit<Proveedor, 'id_proveedor'>;


export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
  rol: Rol;
  id_localidad?: number | null;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
  id_localidad?: number | null;
}

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
  id_localidad?: number | null;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion?: string;
  estado: boolean;
}

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  stock: number;
  precio_unitario: number;
  unidad_medida: string;
  fecha_entrada: string;
  fecha_caducidad?: string | null;
  estado: boolean;
  id_categoria: number;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  cantidad: number;
  precio_unitario: number;
  id_producto: number;
  id_venta: number;
}

export interface Venta {
  id_venta: number;
  fecha: string;
  id_usuario_vendedor: number;
  id_cliente: number;
  detalles: DetalleVenta[];
}

export interface DetalleCompra {
  id_detalle_compra: number;
  cantidad: number;
  precio_compra: number;
  id_orden_compra: number;
  id_producto: number;
}

export interface OrdenCompra {
  id_orden_compra: number;
  estado: string;
  fecha: string;
  id_proveedor: number;
  id_usuario_administrador: number;
  detalles: DetalleCompra[];
}

export interface ProductoStockBajo {
  id_producto: number;
  nombre: string;
  stock: number;
  unidad_medida: string;
}

export interface ProductoVendido {
  id_producto: number;
  nombre: string;
  unidades_vendidas: number;
}

export interface CategoriaResumen {
  id_categoria: number;
  nombre_categoria: string;
  total_productos: number;
  valor_inventario: number;
}

// Esto es lo que devuelve GET /reportes/dashboard.
// Todo viene ya calculado por PostgreSQL (SUM, COUNT, JOIN, GROUP BY),
// el frontend solo lo muestra.
export interface Dashboard {
  valor_inventario: number;
  productos_activos: number;
  productos_stock_bajo: ProductoStockBajo[];
  total_ventas: number;
  valor_vendido: number;
  total_compras: number;
  valor_comprado: number;
  top_productos_vendidos: ProductoVendido[];
  inventario_por_categoria: CategoriaResumen[];
}
