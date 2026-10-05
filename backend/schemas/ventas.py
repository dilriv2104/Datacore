from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class DetalleVentaCrear(BaseModel):
    id_producto: int
    cantidad: int = Field(gt=0)


class DetalleVentaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_detalle_venta: int
    cantidad: int
    precio_unitario: Decimal
    id_producto: int
    id_venta: int


class VentaCrear(BaseModel):
    id_cliente: int
    descuento_porcentaje: Decimal = Field(default=0, ge=0, le=100)
    detalles: list[DetalleVentaCrear]


class VentaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_venta: int
    fecha: datetime
    id_usuario_vendedor: int
    id_cliente: int
    detalles: list[DetalleVentaRespuesta] = Field(default_factory=list)
