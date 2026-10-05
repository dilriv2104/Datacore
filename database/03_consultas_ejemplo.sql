-- CONSULTAS MULTITABLA DE DATACORE
-- Estas consultas sirven para probar la base en pgAdmin o psql.
-- En el backend se hace lo mismo usando SQLAlchemy.

-- 1. Producto con el nombre de su categoria
SELECT p.id_producto, p.nombre, p.stock, p.precio_unitario,
       c.nombre_categoria
FROM producto p
INNER JOIN categoria c ON c.id_categoria = p.id_categoria
ORDER BY p.id_producto DESC;

-- 2. Ventas mostrando vendedor, cliente y producto
SELECT v.id_venta,
       v.fecha,
       u.nombre AS vendedor,
       c.nombre AS cliente,
       p.nombre AS producto,
       dv.cantidad,
       dv.precio_unitario,
       dv.cantidad * dv.precio_unitario AS subtotal
FROM venta v
INNER JOIN usuario u ON u.id_usuario = v.id_usuario_vendedor
INNER JOIN cliente c ON c.id_cliente = v.id_cliente
INNER JOIN detalle_venta dv ON dv.id_venta = v.id_venta
INNER JOIN producto p ON p.id_producto = dv.id_producto
ORDER BY v.fecha DESC;

-- 3. Compras mostrando administrador, proveedor y producto
SELECT oc.id_orden_compra,
       oc.fecha,
       u.nombre AS administrador,
       pr.nombre AS proveedor,
       p.nombre AS producto,
       dc.cantidad,
       dc.precio_compra
FROM orden_compra oc
INNER JOIN usuario u ON u.id_usuario = oc.id_usuario_administrador
INNER JOIN proveedor pr ON pr.id_proveedor = oc.id_proveedor
INNER JOIN detalle_compra dc ON dc.id_orden_compra = oc.id_orden_compra
INNER JOIN producto p ON p.id_producto = dc.id_producto
ORDER BY oc.fecha DESC;

-- 4. Productos con stock bajo
SELECT id_producto, nombre, stock, unidad_medida
FROM producto
WHERE estado = TRUE AND stock <= 3
ORDER BY stock ASC;

-- 5. Valor actual del inventario
SELECT SUM(stock * precio_unitario) AS valor_inventario
FROM producto
WHERE estado = TRUE;
