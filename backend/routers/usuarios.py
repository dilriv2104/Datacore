from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import hash_password, requiere_rol
from database import get_db
from models.usuario import Usuario
from schemas.usuarios import UsuarioCrear, UsuarioRespuesta

router = APIRouter()

@router.get("", response_model=list[UsuarioRespuesta])
def listar_usuarios(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    return db.query(Usuario).order_by(Usuario.id_usuario.desc()).all()

@router.post("", response_model=UsuarioRespuesta, status_code=201)
def crear_usuario(
    datos: UsuarioCrear,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    if datos.rol not in ("administrador", "vendedor"):
        raise HTTPException(status_code=400, detail="Solo se pueden crear administradores o vendedores")

    correo = datos.correo.lower().strip()

    if db.query(Usuario).filter(Usuario.correo == correo).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        correo=correo,
        contrasena=hash_password(datos.contrasena),
        telefono=datos.telefono,
        direccion=datos.direccion,
        rol=datos.rol,
        id_localidad=datos.id_localidad,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.patch("/{id_usuario}/estado", response_model=UsuarioRespuesta)
def cambiar_estado(
    id_usuario: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    usuario = db.get(Usuario, id_usuario)

    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.estado = not usuario.estado
    db.commit()
    db.refresh(usuario)
    return usuario
