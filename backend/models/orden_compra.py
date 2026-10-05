from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from database import Base

class OrdenCompra(Base):
    __tablename__ = "orden_compra"

    id_orden_compra = Column(Integer, primary_key=True)
    estado = Column(String(20), nullable=False, default="pendiente")
    fecha = Column(DateTime, default=datetime.utcnow)
    id_proveedor = Column(Integer, ForeignKey("proveedor.id_proveedor"), nullable=False)
    id_usuario_administrador = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)

class DetalleCompra(Base):
    __tablename__ = "detalle_compra"

    id_detalle_compra = Column(Integer, primary_key=True)
    cantidad = Column(Integer, nullable=False)
    precio_compra = Column(Numeric(10, 2), nullable=False)
    id_orden_compra = Column(Integer, ForeignKey("orden_compra.id_orden_compra"), nullable=False)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), nullable=False)
