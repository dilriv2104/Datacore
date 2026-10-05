"""
Endpoint del dashboard administrativo.

Este es el "dashboard" del proyecto: un resumen del negocio calculado
con consultas multitabla (JOIN, GROUP BY, SUM, COUNT) directamente en
PostgreSQL, no calculado a mano en el frontend. Son el mismo tipo de
consultas que aparecen en database/03_consultas_ejemplo.sql, pero
expuestas como endpoint real para que el frontend las consuma.

    GET /reportes/dashboard -> resumen general (solo administrador)
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import requiere_rol
from database import get_db
from models.categoria import Categoria
from models.orden_compra import DetalleCompra, OrdenCompra
from models.producto import Producto
from models.usuario import Usuario
from models.venta import DetalleVenta, Venta
from schemas.reportes import DashboardRespuesta

router = APIRouter()

UMBRAL_STOCK_BAJO = 3


@router.get("/dashboard", response_model=DashboardRespuesta)
def dashboard(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    # 1. Valor total del inventario activo.
    #    Equivale a la consulta 5 de database/03_consultas_ejemplo.sql:
    #    SELECT SUM(stock * precio_unitario) FROM producto WHERE estado = TRUE;
    valor_inventario = (
        db.query(func.coalesce(func.sum(Producto.stock * Producto.precio_unitario), 0))
        .filter(Producto.estado == True)  # noqa: E712
        .scalar()
    )

    productos_activos = (
        db.query(func.count(Producto.id_producto))
        .filter(Producto.estado == True)  # noqa: E712
        .scalar()
    )

    # 2. Productos con stock bajo.
    #    Equivale a la consulta 4 de database/03_consultas_ejemplo.sql.
    productos_stock_bajo = (
        db.query(Producto)
        .filter(Producto.estado == True, Producto.stock <= UMBRAL_STOCK_BAJO)  # noqa: E712
        .order_by(Producto.stock.asc())
        .all()
    )

    # 3. Ventas: total de ventas registradas y valor total vendido.
    #    JOIN implicito venta -> detalle_venta.
    total_ventas = db.query(func.count(Venta.id_venta)).scalar()

    valor_vendido = (
        db.query(func.coalesce(func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario), 0))
        .scalar()
    )

    # 4. Compras: total de ordenes y valor total comprado.
    #    JOIN implicito orden_compra -> detalle_compra.
    total_compras = db.query(func.count(OrdenCompra.id_orden_compra)).scalar()

    valor_comprado = (
        db.query(func.coalesce(func.sum(DetalleCompra.cantidad * DetalleCompra.precio_compra), 0))
        .scalar()
    )

    # 5. Top 5 productos mas vendidos.
    #    JOIN producto + detalle_venta, agrupado con GROUP BY.
    top_ventas = (
        db.query(
            Producto.id_producto,
            Producto.nombre,
            func.coalesce(func.sum(DetalleVenta.cantidad), 0).label("unidades_vendidas"),
        )
        .outerjoin(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .group_by(Producto.id_producto, Producto.nombre)
        .order_by(func.coalesce(func.sum(DetalleVenta.cantidad), 0).desc())
        .limit(5)
        .all()
    )

    # 6. Valor del inventario agrupado por categoria.
    #    JOIN producto + categoria, agrupado con GROUP BY.
    resumen_categorias = (
        db.query(
            Categoria.id_categoria,
            Categoria.nombre_categoria,
            func.count(Producto.id_producto).label("total_productos"),
            func.coalesce(func.sum(Producto.stock * Producto.precio_unitario), 0).label(
                "valor_inventario"
            ),
        )
        .join(Producto, Producto.id_categoria == Categoria.id_categoria)
        .filter(Producto.estado == True)  # noqa: E712
        .group_by(Categoria.id_categoria, Categoria.nombre_categoria)
        .order_by(Categoria.nombre_categoria)
        .all()
    )

    return {
        "valor_inventario": valor_inventario,
        "productos_activos": productos_activos,
        "productos_stock_bajo": productos_stock_bajo,
        "total_ventas": total_ventas,
        "valor_vendido": valor_vendido,
        "total_compras": total_compras,
        "valor_comprado": valor_comprado,
        "top_productos_vendidos": [
            {
                "id_producto": fila.id_producto,
                "nombre": fila.nombre,
                "unidades_vendidas": fila.unidades_vendidas,
            }
            for fila in top_ventas
        ],
        "inventario_por_categoria": [
            {
                "id_categoria": fila.id_categoria,
                "nombre_categoria": fila.nombre_categoria,
                "total_productos": fila.total_productos,
                "valor_inventario": fila.valor_inventario,
            }
            for fila in resumen_categorias
        ],
    }
