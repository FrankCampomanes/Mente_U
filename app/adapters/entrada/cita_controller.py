import sys
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from app.application.agendar_cita import AgendarCitaUseCase, HorarioNoDisponibleError
from app.adapters.salida.cita_repo_mysql import CitaRepositoryMySQL

router = APIRouter(prefix="/api", tags=["PMV1 - Citas y Reseñas"])

# Inyección de dependencias
repo_mysql = CitaRepositoryMySQL()
use_case_agendar = AgendarCitaUseCase(repo_mysql)

class SolicitarCitaDTO(BaseModel):
    usuario_id: str = Field(..., example="usr-demo-01", description="ID del estudiante")
    disponibilidad_id: str = Field(..., example="disp-01", description="ID del bloque de horario")
    modalidad: str = Field(..., example="virtual", description="'virtual' o 'presencial'")
    costo: Optional[float] = Field(0.0, example=10.0, description="Tarifa acordada")

class RegistrarResenaDTO(BaseModel):
    cita_id: str = Field(..., example="CITA-1024", description="Código único de la cita realizada")
    puntuacion: int = Field(..., ge=1, le=5, example=5, description="Puntuación en estrellas de 1 a 5")
    comentario: str = Field(..., example="Atención muy humana y puntual.", description="Testimonio de la atención")

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
