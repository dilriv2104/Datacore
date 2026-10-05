"""Tabla producto: catalogo con stock y precio."""

from datetime import date

from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, Numeric, String

from database import Base


class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    stock = Column(Integer, nullable=False, default=0)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    unidad_medida = Column(String(30), nullable=False)
    fecha_entrada = Column(Date, default=date.today)
    fecha_caducidad = Column(Date)
    estado = Column(Boolean, nullable=False, default=True)
    id_categoria = Column(Integer, ForeignKey("categoria.id_categoria"), nullable=False)
