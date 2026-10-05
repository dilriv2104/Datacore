"""Crea el primer usuario administrador de DataCore desde la terminal."""

from getpass import getpass

from auth import hash_password
from database import SessionLocal
from models.usuario import Usuario


def main():
    db = SessionLocal()
    try:
        if db.query(Usuario).filter(Usuario.rol == "administrador").first():
            print("Ya existe un administrador. Usa el modulo Usuarios para crear otro.")
            return

        nombre = input("Nombre del administrador: ").strip()
        correo = input("Correo del administrador: ").strip().lower()
        contrasena = getpass("Contraseña: ")
        confirmar = getpass("Confirmar contraseña: ")

        if len(nombre) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres.")
        if "@" not in correo:
            raise ValueError("Escribe un correo válido.")
        if len(contrasena) < 4:
            raise ValueError("La contraseña debe tener al menos 4 caracteres.")
        if contrasena != confirmar:
            raise ValueError("Las contraseñas no coinciden.")
        if db.query(Usuario).filter(Usuario.correo == correo).first():
            raise ValueError("Ese correo ya está registrado.")

        usuario = Usuario(
            nombre=nombre,
            correo=correo,
            contrasena=hash_password(contrasena),
            rol="administrador",
            estado=True,
        )
        db.add(usuario)
        db.commit()
        print("Administrador creado correctamente.")
    except Exception as error:
        db.rollback()
        print(f"No se pudo crear el administrador: {error}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
