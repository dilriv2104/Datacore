"""
Autenticacion: hash de contraseñas y tokens JWT.

- Las contraseñas nunca se guardan en texto plano: se
  guardan como "sal$hash" usando PBKDF2.
- El login entrega un token JWT que el frontend manda en
  cada request dentro del header "Authorization: Bearer ...".
"""

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from models.usuario import Usuario

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError(
        "Falta JWT_SECRET en backend/.env. Configura una clave propia antes de iniciar la API."
    )

JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

_bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Genera una sal aleatoria y devuelve 'sal$hash'."""
    sal = secrets.token_hex(16)
    hash_generado = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), sal.encode(), 120_000
    ).hex()
    return f"{sal}${hash_generado}"


def verificar_password(password: str, guardado: str) -> bool:
    """Compara una contraseña en texto plano contra el hash guardado."""
    try:
        sal, hash_guardado = guardado.split("$", 1)
    except ValueError:
        return False

    hash_calculado = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), sal.encode(), 120_000
    ).hex()
    return secrets.compare_digest(hash_calculado, hash_guardado)


def crear_token(usuario: Usuario) -> str:
    """Crea un token JWT que expira en JWT_EXPIRE_MINUTES."""
    payload = {
        "sub": str(usuario.id_usuario),
        "rol": usuario.rol,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """
    Dependencia de FastAPI: lee el token del header
    Authorization, lo valida y devuelve el usuario logueado.
    Se usa en cualquier endpoint que requiera sesion iniciada.
    """
    if credenciales is None:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión")

    try:
        payload = jwt.decode(credenciales.credentials, JWT_SECRET, algorithms=["HS256"])
        id_usuario = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Sesión inválida o vencida")

    usuario = db.get(Usuario, id_usuario)
    if usuario is None or not usuario.estado:
        raise HTTPException(status_code=401, detail="Usuario inactivo")

    return usuario


def requiere_rol(*roles_permitidos: str):
    """
    Dependencia con parametros: úsala como
    Depends(requiere_rol('administrador')) para que un
    endpoint solo lo puedan usar ciertos roles.
    """

    def validador(usuario: Usuario = Depends(usuario_actual)) -> Usuario:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")
        return usuario

    return validador
