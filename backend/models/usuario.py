from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), nullable=False, unique=True)
    contrasena = Column(String(255), nullable=False)
    telefono = Column(String(20))
    direccion = Column(String(150))
    estado = Column(Boolean, nullable=False, default=True)
    rol = Column(String(20), nullable=False)
    id_localidad = Column(Integer, ForeignKey("localidad.id_localidad"))
    fecha_registro = Column(DateTime, default=datetime.utcnow)
