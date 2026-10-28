import sys
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from app.application.agendar_cita import AgendarCitaUseCase, HorarioNoDisponibleError
from app.adapters.salida.cita_repo_mysql import CitaRepositoryMySQL

router = APIRouter(prefix="/api", tags=["PMV1 - MenteU"])

# Inyección de dependencias
repo_mysql = CitaRepositoryMySQL()
use_case_agendar = AgendarCitaUseCase(repo_mysql)

# --- DTOs ---
class SolicitarCitaDTO(BaseModel):
    usuario_id: str = Field(..., example="usr-demo-01", description="ID del estudiante")
    disponibilidad_id: str = Field(..., example="disp-01", description="ID del bloque de horario")
    modalidad: str = Field(..., example="virtual", description="'virtual' o 'presencial'")
    costo: Optional[float] = Field(0.0, example=10.0, description="Tarifa acordada")

class RegistrarResenaDTO(BaseModel):
    cita_id: str = Field(..., example="CITA-1024", description="Código único de la cita realizada")
    puntuacion: int = Field(..., ge=1, le=5, example=5, description="Puntuación en estrellas de 1 a 5")
    comentario: str = Field(..., example="Atención muy humana y puntual.", description="Testimonio de la atención")

class RegistroUsuarioDTO(BaseModel):
    nombre: str = Field(..., example="Frank Campomanes", description="Nombre y apellido del estudiante")
    email: str = Field(..., example="frank@utp.edu.pe", description="Correo institucional o personal")
    password: str = Field(..., min_length=4, example="123456", description="Contraseña de acceso")
    telefono: Optional[str] = Field("", example="987654321", description="Número de teléfono de contacto")
    codigo_estudiante: Optional[str] = Field("", example="U20215432", description="Código de alumno UTP")

class LoginUsuarioDTO(BaseModel):
    email: str = Field(..., example="frank@utp.edu.pe", description="Correo registrado")
    password: str = Field(..., example="123456", description="Contraseña")

class MensajeChatDTO(BaseModel):
    usuario_id: str = Field(..., example="usr-demo-01", description="ID del estudiante en la sesión")
    remitente: str = Field(..., example="usuario", description="'usuario' o 'asistente'")
    texto: str = Field(..., example="Hola, tengo mucha ansiedad antes de los exámenes parciales.", description="Contenido del mensaje")


# --- ENDPOINTS AUTENTICACIÓN ---
@router.post("/auth/registro", status_code=status.HTTP_201_CREATED, summary="Registrar nuevo estudiante")
def registrar_usuario(datos: RegistroUsuarioDTO):
    try:
        id_usuario = "usr-" + str(uuid.uuid4())[:8]
        usuario = repo_mysql.registrar_usuario(
            id_usuario=id_usuario,
            nombre=datos.nombre,
            email=datos.email,
            password=datos.password,
            telefono=datos.telefono or "",
            codigo_estudiante=datos.codigo_estudiante or ""
        )
        return {
            "mensaje": "Usuario registrado exitosamente en MenteU",
            "usuario": usuario
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error en el servidor: {str(e)}")

@router.post("/auth/login", summary="Iniciar sesión de estudiante")
def login_usuario(credenciales: LoginUsuarioDTO):
    usuario = repo_mysql.autenticar_usuario(
        email=credenciales.email,
        password=credenciales.password
    )
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifica tu correo y contraseña."
        )
    return {
        "mensaje": "Inicio de sesión exitoso en MenteU",
        "usuario": usuario
    }

@router.get("/auth/usuario/{usuario_id}", summary="Obtener perfil de estudiante")
def obtener_perfil(usuario_id: str):
    usuario = repo_mysql.obtener_usuario_por_id(usuario_id)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return usuario


# --- ENDPOINTS HISTORIAL DE CHAT ---
@router.post("/chat/mensajes", status_code=status.HTTP_201_CREATED, summary="Guardar mensaje de conversación")
def guardar_mensaje(mensaje: MensajeChatDTO):
    id_mensaje = "msg-" + str(uuid.uuid4())[:8]
    guardado = repo_mysql.guardar_mensaje_chat(
        id_mensaje=id_mensaje,
        usuario_id=mensaje.usuario_id,
        remitente=mensaje.remitente,
        texto=mensaje.texto
    )
    return {
        "mensaje": "Mensaje guardado en el historial",
        "registro": guardado
    }

@router.get("/chat/mensajes/{usuario_id}", summary="Obtener historial de mensajes de un estudiante")
def obtener_historial_chat(usuario_id: str):
    return repo_mysql.listar_mensajes_chat(usuario_id)


# --- ENDPOINTS CITAS Y PROFESIONALES ---
@router.post("/citas", status_code=status.HTTP_201_CREATED, summary="Agendar una cita en el PMV1")
def registrar_cita(solicitud: SolicitarCitaDTO):
    try:
        cita = use_case_agendar.ejecutar(
            usuario_id=solicitud.usuario_id,
            disponibilidad_id=solicitud.disponibilidad_id,
            modalidad=solicitud.modalidad,
            costo=solicitud.costo or 0.0
        )
        return {
            "mensaje": "Cita registrada y horario reservado con éxito en el PMV1",
            "cita": {
                "id": cita.id,
                "usuario_id": cita.usuario_id,
                "disponibilidad_id": cita.disponibilidad_id,
                "modalidad": cita.modalidad,
                "estado": cita.estado,
                "costo": cita.costo_informado_soles
            }
        }
    except HorarioNoDisponibleError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error en persistencia: {str(e)}")

@router.get("/citas/usuario/{usuario_id}", summary="Consultar citas de un estudiante")
def listar_citas(usuario_id: str):
    return repo_mysql.listar_citas_usuario(usuario_id)

@router.post("/resenas", status_code=status.HTTP_201_CREATED, summary="Registrar calificación y reseña de cita")
def guardar_resena(resena: RegistrarResenaDTO):
    id_resena = str(uuid.uuid4())
    resultado = repo_mysql.registrar_resena(
        id_resena=id_resena,
        cita_id=resena.cita_id,
        puntuacion=resena.puntuacion,
        comentario=resena.comentario
    )
    return {
        "mensaje": "Reseña registrada con éxito en el PMV1",
        "resena": resultado
    }

@router.get("/profesionales", summary="Listar catálogo de profesionales disponibles")
def obtener_profesionales():
    return repo_mysql.listar_profesionales()
