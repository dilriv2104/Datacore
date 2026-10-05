from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import requiere_rol
from database import get_db
from models.orden_compra import DetalleCompra, OrdenCompra
from models.producto import Producto
from models.proveedor import Proveedor
from models.usuario import Usuario
from schemas.compras import OrdenCompraCrear, OrdenCompraRespuesta

router = APIRouter()

def _armar_compra(orden: OrdenCompra, db: Session):
    detalles = db.query(DetalleCompra).filter(
        DetalleCompra.id_orden_compra == orden.id_orden_compra
    ).all()

    return {
        "id_orden_compra": orden.id_orden_compra,
        "estado": orden.estado,
        "fecha": orden.fecha,
        "id_proveedor": orden.id_proveedor,
        "id_usuario_administrador": orden.id_usuario_administrador,
        "detalles": detalles,
    }

@router.get("", response_model=list[OrdenCompraRespuesta])
def listar_ordenes(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    ordenes = db.query(OrdenCompra).order_by(OrdenCompra.id_orden_compra.desc()).all()
    return [_armar_compra(o, db) for o in ordenes]

@router.post("", response_model=OrdenCompraRespuesta, status_code=201)
def crear_orden(
    datos: OrdenCompraCrear,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(requiere_rol("administrador")),
):
    proveedor = db.get(Proveedor, datos.id_proveedor)

    if proveedor is None or not proveedor.estado:
        raise HTTPException(status_code=400, detail="Proveedor no encontrado o inactivo")

    if not datos.detalles:
        raise HTTPException(status_code=400, detail="La orden debe tener al menos un producto")

    orden = OrdenCompra(
        estado="recibida",
        id_proveedor=proveedor.id_proveedor,
        id_usuario_administrador=admin.id_usuario,
    )
    db.add(orden)
    db.flush()

    try:
        for detalle in datos.detalles:
            producto = db.get(Producto, detalle.id_producto)
            if producto is None or not producto.estado:
                raise HTTPException(status_code=400, detail="Producto no encontrado o inactivo")

            db.add(DetalleCompra(
                id_orden_compra=orden.id_orden_compra,
                id_producto=detalle.id_producto,
                cantidad=detalle.cantidad,
                precio_compra=detalle.precio_compra,
            ))

        db.commit()
        db.refresh(orden)
        return _armar_compra(orden, db)

    except Exception:
        db.rollback()
        raise
