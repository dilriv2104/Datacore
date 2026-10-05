from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import requiere_rol
from database import get_db
from models.cliente import Cliente
from models.usuario import Usuario
from schemas.clientes import ClienteCrear, ClienteRespuesta

router = APIRouter()


@router.get("", response_model=list[ClienteRespuesta])
def listar_clientes(
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(requiere_rol("administrador", "vendedor")),
):
    return db.query(Cliente).order_by(Cliente.nombre).all()


@router.post("", response_model=ClienteRespuesta, status_code=201)
def crear_cliente(
    datos: ClienteCrear,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(requiere_rol("administrador", "vendedor")),
):
    cliente = Cliente(**datos.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.put("/{id_cliente}", response_model=ClienteRespuesta)
def editar_cliente(
    id_cliente: int,
    datos: ClienteCrear,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(requiere_rol("administrador", "vendedor")),
):
    cliente = db.get(Cliente, id_cliente)
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    for campo, valor in datos.model_dump().items():
        setattr(cliente, campo, valor)

    db.commit()
    db.refresh(cliente)
    return cliente


@router.patch("/{id_cliente}/estado", response_model=ClienteRespuesta)
def cambiar_estado_cliente(
    id_cliente: int,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(requiere_rol("administrador", "vendedor")),
):
    cliente = db.get(Cliente, id_cliente)
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    cliente.estado = not cliente.estado
    db.commit()
    db.refresh(cliente)
    return cliente
