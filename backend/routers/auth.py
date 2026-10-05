from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import crear_token, hash_password, usuario_actual, verificar_password
from database import get_db
from models.usuario import Usuario
from schemas.usuarios import Login, LoginRespuesta, RegistroPublico, UsuarioRespuesta

router = APIRouter()

@router.post("/login", response_model=LoginRespuesta)
def login(datos: Login, db: Session = Depends(get_db)):
    correo = datos.correo.lower().strip()
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()

    if usuario is None or not usuario.estado:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    if not verificar_password(datos.contrasena, usuario.contrasena):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    return {"token": crear_token(usuario), "usuario": usuario}

@router.post("/registro", response_model=LoginRespuesta, status_code=201)
def registro(datos: RegistroPublico, db: Session = Depends(get_db)):
    correo = datos.correo.lower().strip()

    if db.query(Usuario).filter(Usuario.correo == correo).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        correo=correo,
        contrasena=hash_password(datos.contrasena),
        telefono=datos.telefono,
        direccion=datos.direccion,
        rol="vendedor",
        estado=True,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {"token": crear_token(nuevo_usuario), "usuario": nuevo_usuario}

@router.get("/me", response_model=UsuarioRespuesta)
def me(usuario: Usuario = Depends(usuario_actual)):
    return usuario
