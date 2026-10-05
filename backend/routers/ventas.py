from fastapi import APIRouter, Depends, HTTPException
from decimal import Decimal

from sqlalchemy.orm import Session
from auth import requiere_rol
from database import get_db
from models.cliente import Cliente
from models.producto import Producto
from models.usuario import Usuario
from models.venta import DetalleVenta, Venta
from schemas.ventas import VentaCrear, VentaRespuesta

router = APIRouter()

def _armar_venta(venta: Venta, db: Session):
    detalles = db.query(DetalleVenta).filter(
        DetalleVenta.id_venta == venta.id_venta
    ).all()

    return {
        "id_venta": venta.id_venta,
        "fecha": venta.fecha,
        "id_usuario_vendedor": venta.id_usuario_vendedor,
        "id_cliente": venta.id_cliente,
        "detalles": detalles,
    }

@router.get("", response_model=list[VentaRespuesta])
def listar_ventas(
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(requiere_rol("administrador", "vendedor")),
):
    ventas = db.query(Venta).order_by(Venta.id_venta.desc()).all()
    return [_armar_venta(v, db) for v in ventas]

@router.post("", response_model=VentaRespuesta, status_code=201)
def crear_venta(
    datos: VentaCrear,
    db: Session = Depends(get_db),
    vendedor: Usuario = Depends(requiere_rol("administrador", "vendedor")),
):
    cliente = db.get(Cliente, datos.id_cliente)

    if cliente is None or not cliente.estado:
        raise HTTPException(status_code=400, detail="Cliente no encontrado o inactivo")

    if not datos.detalles:
        raise HTTPException(status_code=400, detail="La venta debe tener al menos un producto")

    venta = Venta(
        id_usuario_vendedor=vendedor.id_usuario,
        id_cliente=cliente.id_cliente,
    )
    db.add(venta)
    db.flush()

    try:
        for detalle in datos.detalles:
            producto = db.get(Producto, detalle.id_producto)

            if producto is None or not producto.estado:
                raise HTTPException(status_code=400, detail="Producto no encontrado o inactivo")

            # El precio se toma del producto en PostgreSQL, no del navegador.
            # Así el cliente no puede alterar el precio real de la venta.
            db.add(DetalleVenta(
                id_venta=venta.id_venta,
                id_producto=detalle.id_producto,
                cantidad=detalle.cantidad,
                precio_unitario=(producto.precio_unitario * (Decimal("1") - datos.descuento_porcentaje / Decimal("100"))).quantize(Decimal("0.01")),
            ))

        db.commit()
        db.refresh(venta)
        return _armar_venta(venta, db)

    except HTTPException:
        # Errores de validacion que ya lanzamos nosotros (ej. producto
        # inactivo): se reenvian tal cual, sin reenvolver el mensaje.
        db.rollback()
        raise
    except Exception as error:
        # Errores que vienen de la base de datos (ej. el trigger de
        # stock insuficiente en PostgreSQL).
        db.rollback()
        mensaje = str(getattr(error, "orig", None) or error)
        raise HTTPException(status_code=400, detail=mensaje)
