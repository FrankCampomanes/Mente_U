import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from app.adapters.salida.cita_repo_mysql import CitaRepositoryMySQL
from app.adapters.entrada.cita_controller import (
    registrar_usuario, login_usuario, guardar_mensaje, obtener_historial_chat,
    RegistroUsuarioDTO, LoginUsuarioDTO, MensajeChatDTO
)
from fastapi import HTTPException

def test_registro_y_login_usuario():
    repo = CitaRepositoryMySQL()
    # 1. Registro directo en el repositorio
    usuario = repo.registrar_usuario(
        id_usuario="usr-test-99",
        nombre="Carlos Test",
        email="carlos_test@utp.edu.pe",
        password="clave123",
        telefono="999888777",
        codigo_estudiante="U21112233"
    )
    assert usuario["id"] == "usr-test-99"
    assert usuario["email"] == "carlos_test@utp.edu.pe"

    # 2. Login correcto
    autenticado = repo.autenticar_usuario(
        email="carlos_test@utp.edu.pe",
        password="clave123"
    )
    assert autenticado is not None
    assert autenticado["id"] == "usr-test-99"

    # 3. Login incorrecto
    fallido = repo.autenticar_usuario(
        email="carlos_test@utp.edu.pe",
        password="clave_incorrecta"
    )
    assert fallido is None

def test_historial_chat_persistente():
    repo = CitaRepositoryMySQL()
    uid = "usr-test-chat-persistencia"

    # Guardar mensaje usuario
    m1 = repo.guardar_mensaje_chat(
        id_mensaje="msg-t1",
        usuario_id=uid,
        remitente="usuario",
        texto="Necesito orientación para organizar mis horarios"
    )
    assert m1["id"] == "msg-t1"

    # Guardar mensaje asistente
    m2 = repo.guardar_mensaje_chat(
        id_mensaje="msg-t2",
        usuario_id=uid,
        remitente="asistente",
        texto="¡Hola! Con gusto te ayudo a crear un cronograma."
    )
    assert m2["id"] == "msg-t2"

    # Listar mensajes
    historial = repo.listar_mensajes_chat(uid)
    assert len(historial) >= 2
    textos = [m["texto"] for m in historial]
    assert "Necesito orientación para organizar mis horarios" in textos
