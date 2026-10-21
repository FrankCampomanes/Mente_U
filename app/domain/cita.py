from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Cita:
    id: str
    usuario_id: str
    disponibilidad_id: str
    modalidad: str  # 'virtual' | 'presencial'
    estado: str = 'solicitada'  # 'solicitada' | 'confirmada' | 'cancelada' | 'realizada'
    costo_informado_soles: float = 0.0
    condiciones_aceptadas: bool = True
    fecha_creacion: Optional[datetime] = None

    def validar_para_registro(self):
        if not self.usuario_id or not self.usuario_id.strip():
            raise ValueError("El usuario_id es obligatorio para agendar la cita.")
        if not self.disponibilidad_id or not self.disponibilidad_id.strip():
            raise ValueError("La disponibilidad_id es obligatoria para agendar la cita.")
        if self.modalidad not in ('virtual', 'presencial'):
            raise ValueError("La modalidad debe ser 'virtual' o 'presencial'.")
        if self.costo_informado_soles < 0:
            raise ValueError("El costo informado no puede ser negativo.")
