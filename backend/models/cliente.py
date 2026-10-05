from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from database import Base

class Cliente(Base):
    __tablename__ = "cliente"

    id_cliente = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100))
    telefono = Column(String(20))
    direccion = Column(String(150))
    estado = Column(Boolean, nullable=False, default=True)
    id_localidad = Column(Integer, ForeignKey("localidad.id_localidad"))
