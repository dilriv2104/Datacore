"""Tablas de ubicacion: ciudad y localidad."""

from sqlalchemy import Column, ForeignKey, Integer, String

from database import Base


class Ciudad(Base):
    __tablename__ = "ciudad"

    id_ciudad = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False, unique=True)


class Localidad(Base):
    __tablename__ = "localidad"

    id_localidad = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    id_ciudad = Column(Integer, ForeignKey("ciudad.id_ciudad"), nullable=False)
