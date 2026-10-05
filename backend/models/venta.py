from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric
from database import Base

class Venta(Base):
    __tablename__ = "venta"

    id_venta = Column(Integer, primary_key=True)
    fecha = Column(DateTime, default=datetime.utcnow)
    id_usuario_vendedor = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_cliente = Column(Integer, ForeignKey("cliente.id_cliente"), nullable=False)

class DetalleVenta(Base):
    __tablename__ = "detalle_venta"

    id_detalle_venta = Column(Integer, primary_key=True)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), nullable=False)
    id_venta = Column(Integer, ForeignKey("venta.id_venta"), nullable=False)
