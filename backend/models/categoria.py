"""Tabla categoria: agrupa los productos del catalogo."""

from sqlalchemy import Boolean, Column, Integer, String

from database import Base


class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria = Column(Integer, primary_key=True)
    nombre_categoria = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(255))
    estado = Column(Boolean, nullable=False, default=True)
