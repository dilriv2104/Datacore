from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import requiere_rol
from database import get_db
from models.proveedor import Proveedor
from models.usuario import Usuario
from schemas.proveedores import ProveedorCrear, ProveedorRespuesta

router = APIRouter()


@router.get("", response_model=list[ProveedorRespuesta])
def listar_proveedores(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    return db.query(Proveedor).order_by(Proveedor.nombre).all()


@router.post("", response_model=ProveedorRespuesta, status_code=201)
def crear_proveedor(
    datos: ProveedorCrear,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    proveedor = Proveedor(**datos.model_dump())
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.put("/{id_proveedor}", response_model=ProveedorRespuesta)
def editar_proveedor(
    id_proveedor: int,
    datos: ProveedorCrear,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    proveedor = db.get(Proveedor, id_proveedor)
    if proveedor is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    for campo, valor in datos.model_dump().items():
        setattr(proveedor, campo, valor)

    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.patch("/{id_proveedor}/estado", response_model=ProveedorRespuesta)
def cambiar_estado_proveedor(
    id_proveedor: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    proveedor = db.get(Proveedor, id_proveedor)
    if proveedor is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    proveedor.estado = not proveedor.estado
    db.commit()
    db.refresh(proveedor)
    return proveedor
