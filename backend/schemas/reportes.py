"""Esquemas Pydantic para el dashboard / reportes administrativos."""

from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductoStockBajo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_producto: int
    nombre: str
    stock: int
    unidad_medida: str


class ProductoVendido(BaseModel):
    id_producto: int
    nombre: str
    unidades_vendidas: int


class CategoriaResumen(BaseModel):
    id_categoria: int
    nombre_categoria: str
    total_productos: int
    valor_inventario: Decimal


class DashboardRespuesta(BaseModel):
    """
    Resumen general del negocio, calculado directamente en la
    base de datos (SUM, COUNT, JOIN, GROUP BY), no en el frontend.
    """

    valor_inventario: Decimal
    productos_activos: int
    productos_stock_bajo: list[ProductoStockBajo]

    total_ventas: int
    valor_vendido: Decimal

    total_compras: int
    valor_comprado: Decimal

    top_productos_vendidos: list[ProductoVendido]
    inventario_por_categoria: list[CategoriaResumen]
