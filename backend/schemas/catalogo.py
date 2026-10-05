"""Esquemas Pydantic para categoria y producto."""

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoriaBase(BaseModel):
    nombre_categoria: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None
    estado: bool = True


class CategoriaRespuesta(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)
    id_categoria: int


class ProductoCrear(BaseModel):
    nombre: str
    descripcion: str | None = None
    stock: int = Field(default=0, ge=0)
    precio_unitario: Decimal = Field(gt=0)
    unidad_medida: str
    fecha_entrada: date = Field(default_factory=date.today)
    fecha_caducidad: date | None = None
    estado: bool = True
    id_categoria: int


class ProductoActualizar(ProductoCrear):
    """Mismos campos que ProductoCrear: se usa en el PUT."""


class ProductoRespuesta(ProductoCrear):
    model_config = ConfigDict(from_attributes=True)
    id_producto: int
