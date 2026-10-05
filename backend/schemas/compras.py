from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class DetalleCompraCrear(BaseModel):
    id_producto: int
    cantidad: int = Field(gt=0)
    precio_compra: Decimal = Field(gt=0)

class DetalleCompraRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_detalle_compra: int
    cantidad: int
    precio_compra: Decimal
    id_orden_compra: int
    id_producto: int

class OrdenCompraCrear(BaseModel):
    id_proveedor: int
    detalles: list[DetalleCompraCrear]

class OrdenCompraRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_orden_compra: int
    estado: str
    fecha: datetime
    id_proveedor: int
    id_usuario_administrador: int
    detalles: list[DetalleCompraRespuesta] = Field(default_factory=list)
